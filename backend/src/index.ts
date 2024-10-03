// Update preitter to have this file imported first so that it will
// load all of the environment variables
import { env } from "./utils/env";

import { createBullBoard } from "@bull-board/api";
import { HonoAdapter } from "@bull-board/hono";
import "@bull-board/hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { swaggerUI } from "@hono/swagger-ui";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { v7 as uuid } from "uuid";

import { iamRouter } from "./api/iam";
import { testRouter } from "./api/testing";
import { asyncLocalStorage, log } from "./lib/logger";
import { correlationIdMiddleware } from "./middlewares/correlation-id";
import { createHonoApp } from "./utils/app";
import { HttpError, InternalServerError, NotFoundError } from "./utils/http";
import { taskQueue } from "./utils/task-queue";

const app = createHonoApp();

// ==========================
// Middlewares
// ==========================

app.use(
    "/api/*",
    cors({
        origin: env.CORS_ORIGINS,
        allowHeaders: [],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);

app.use(
    requestId({
        generator(_c) {
            return uuid();
        },
        headerName: "X-Request-ID",
    }),
);
app.use(correlationIdMiddleware);

app.use(async function runWithinContext(c, next) {
    const requestId = c.get("requestId") ?? "-";
    const correlationId = c.get("correlationId") ?? "-";

    // Run the request inside AsyncLocalStorage context
    return asyncLocalStorage.run({ correlationId, requestId }, () => next());
});

app.use(compress({ encoding: "gzip" }));

// ==========================
// Events
// ==========================

app.onError(function handleAppError(err, c) {
    if (err instanceof HttpError) {
        return err.toJSON(c);
    } else {
        log.error(`Unhandled error: ${err}\n${err.stack}`);
        return new InternalServerError({ message: "Internal Servier Error" }).toJSON(c);
    }
});

app.notFound(function handleNotFound(c) {
    return new NotFoundError({ message: "Not Found" }).toJSON(c);
});

// ==========================
// Task Queue Setup
// ==========================

const serverAdapter = new HonoAdapter(serveStatic);
createBullBoard({ serverAdapter, queues: taskQueue.queueAdapter });

const basePath = "/api/task-queue/ui";
serverAdapter.setBasePath(basePath);
app.route(basePath, serverAdapter.registerPlugin());

// ==========================
// Endpoints
// ==========================

app.doc("/api/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Bones",
    },
});
app.get("/api/doc/ui", swaggerUI({ url: "/api/doc" }));

app.route("/api/v1/test", testRouter);
app.route("/api/v1/iam", iamRouter);

log.info(`Server is running on port ${env.PORT}`);

serve({
    fetch: app.fetch,
    port: env.PORT,
});
