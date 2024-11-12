import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

Deno.serve({ port: 8000 }, app.fetch);
