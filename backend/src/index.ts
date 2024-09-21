import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { testRouter } from "./api/testing";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { compress } from "hono/compress";

const app = new Hono();

app.use(
    "/api/*",
    cors({
        origin: "http://localhost:3000",
        allowHeaders: [],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);
app.use(prettyJSON());
app.use(compress({ encoding: "gzip" }));

app.route("/api/test", testRouter);

const port = 8000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
