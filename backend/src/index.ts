// Update preitter to have this file imported first so that it will
// load all of the environment variables
import { env } from "./utils/env";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { ulid } from "ulid";

import { iamRouter } from "./api/iam";
import { testRouter } from "./api/testing";
import { log } from "./lib/logger";
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
app.use(logger());
app.use(async function printRequestTrackingInfo(c, next) {
    // TODO: fina a better way to map logs with requestId and correlationId.
    // This middleware isn't useful.
    log.info(`[X-Request-ID] ${c.get("requestId")}`);
    log.info(`[X-correlation-ID] ${c.get("correlationId")}`);
    await next();
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
