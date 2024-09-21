import { Hono } from "hono";

const app = new Hono();

app.get("/", function testingRoute(c) {
    return c.json({ message: "💀 Bones is live" });
});

export { app as testRouter };
