// Update preitter to have this file imported first so that it will
// load all of the environment variables
import { env } from "./utils/env";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";

import { testRouter } from "./api/testing";

const app = new Hono();

// ==========================
// Middlewares
// ==========================

app.use(
    "/api/*",
    cors({
        origin: "http://localhost:3000",
        allowHeaders: [],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);
app.use(compress({ encoding: "gzip" }));

// ==========================
// Endpoints
// ==========================

app.route("/api/test", testRouter);

console.log(`Server is running on port ${env.PORT}`);

serve({
    fetch: app.fetch,
    port: env.PORT,
});
