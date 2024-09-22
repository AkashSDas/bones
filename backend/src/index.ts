// Update preitter to have this file imported first so that it will
// load all of the environment variables
import { env } from "./utils/env";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { ulid } from "ulid";

import { testRouter } from "./api/testing";
import { log } from "./lib/logger";
import { correlationIdMiddleware } from "./middlewares/correlation-id";
import type { HonoVariables } from "./utils/types";

const app = new Hono<{ Variables: HonoVariables }>();

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
    log.info(`[X-Request-ID] ${c.get("requestId")}`);
    log.info(`[X-correlation-ID] ${c.get("correlationId")}`);
    await next();
});

app.use(compress({ encoding: "gzip" }));

// ==========================
// Endpoints
// ==========================

app.route("/api/test", testRouter);

log.info(`Server is running on port ${env.PORT}`);

serve({
    fetch: app.fetch,
    port: env.PORT,
});
