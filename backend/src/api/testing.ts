import { Hono } from "hono";

import type { AppBindings } from "@/utils/types";

const app = new Hono<AppBindings>();

app.get("/", function testingRoute(c) {
    return c.json({ message: "💀 Bones is live" });
});

export { app as testRouter };
