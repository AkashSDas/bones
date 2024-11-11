import { type Context, Hono } from "jsr:@hono/hono";
import { status } from "#utils/http.ts";

const app = new Hono();

app.get("/ping", (c: Context) => {
    return c.json({ message: "Bridge is active" }, status.OK);
});

Deno.serve({ port: 4000 }, app.fetch);
