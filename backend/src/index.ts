// Update preitter to have this file imported first so that it will
// load all of the environment variables
import { env } from "./utils/env";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { ulid } from "ulid";

import { iamRouter } from "./api/iam";
import { testRouter } from "./api/testing";
import { asyncLocalStorage, log } from "./lib/logger";
import { correlationIdMiddleware } from "./middlewares/correlation-id";
import type { AppBindings } from "./utils/types";

const app = new OpenAPIHono<AppBindings>();

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
            return ulid();
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
