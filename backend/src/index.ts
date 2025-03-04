// This file will be imported before others are import because this will
// load ll of the environment variables
import { env } from "./utils/env";

import { createBullBoard } from "@bull-board/api";
import { HonoAdapter } from "@bull-board/hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { v7 as uuid } from "uuid";

import { iamRouter } from "./api/iam";
import { iamPermissionRouter } from "./api/iam-permission";
import { pingRouter } from "./api/ping";
import { workspaceRouter } from "./api/workspace";
import "./db/migrate";
import { asyncLocalStorage, log } from "./lib/logger";
import { correlationId } from "./middlewares/correlation-id";
import { createHonoApp } from "./utils/app";
import { HttpError, InternalServerError, NotFoundError } from "./utils/http";
import { queue } from "./utils/task-queue";

const app = createHonoApp();

const store = new CookieStore();

// ==========================
// Middlewares
// ==========================

app.use(
    "/api/*",
    sessionMiddleware({
        store,
        encryptionKey: env.COOKIE_ENCRYPTION_KEY,
        expireAfterSeconds: 24 * 60 * 60, // max can be 400 days
        cookieOptions: {
            sameSite: "lax", // Recommended to avoid XSS attacks
            httpOnly: true, // Recommended to avoid XSS attacks
            secure: env.ENV === "production", // Recommended for basic CSRF protection in modern browsers
            path: "/", // Required for this library to work properly
            maxAge: 24 * 60 * 60, // max can be 400 days
        },
    }),
);

app.use(
    "/api/*",
    cors({
        origin: env.CORS_ORIGINS,
        allowMethods: ["POST", "PATCH", "DELETE", "GET", "OPTIONS"],
        credentials: true,
    }),
);

// Request id is useful for tracking the request
app.use(
    requestId({
        generator(_c) {
            return uuid();
        },
        headerName: "X-Request-ID",
    }),
);

// Correlation id is useful for tracking the request across API calls in a micro-service architecture
app.use(correlationId);

app.use(async function runWithinContext(c, next) {
    const requestId = c.get("requestId") ?? "-";
    const correlationId = c.get("correlationId") ?? "-";

    // Run the request inside AsyncLocalStorage context so that we've access to the
    // all the variables stored inside of this storage and don't have struggle and pass
    // these values across functions/methods/classes and what not
    return asyncLocalStorage.run({ correlationId, requestId }, () => next());
});

// For faster API response responses
app.use(compress({ encoding: "gzip" }));

// ==========================
// Events
// ==========================

app.onError(function handleAppError(err, c) {
    if (err instanceof HttpError) {
        return err.toJSON(c);
    } else {
        log.error(`Unhandled error: ${err}\n${err.stack}`);
        return new InternalServerError({
            reason: "Internal Server Error (unhandled)",
            message: "Internal Server Error",
        }).toJSON(c);
    }
});

app.notFound(function handleNotFound(c) {
    return new NotFoundError({
        reason: "Route Not Found",
        message: "Not Found",
    }).toJSON(c);
});

// ==========================
// Task Queue Setup
// ==========================

// Task queues are used for running long running tasks in the background and quickly
// sending response to the frontend.

const serverAdapter = new HonoAdapter(serveStatic);
const basePath = "/api/task-queue/ui"; // See task queues in the dashboard in this endpoint

createBullBoard({ serverAdapter, queues: queue.queueAdapter });
serverAdapter.setBasePath(basePath);
app.route(basePath, serverAdapter.registerPlugin());

// ==========================
// Endpoints
// ==========================

// API documentation endpoints. Generated automatically via Swagger and HonoJS
app.doc("/api/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Bones",
    },
});
app.get("/api/doc/ui", swaggerUI({ url: "/api/doc" }));
app.get("/api/doc/ref", apiReference({ spec: { url: "/api/doc" } }));

// Endpoints for testing backend is active or not and miscellaneous info
app.route("/api/v1/ping", pingRouter);

// Core endpoints
app.route("/api/v1/iam", iamRouter);
app.route("/api/v1/iam-permission", iamPermissionRouter);
app.route("/api/v1/workspace", workspaceRouter);

log.info(`Server is running on port ${env.PORT}`);

serve({
    fetch: app.fetch,
    port: env.PORT,
});
