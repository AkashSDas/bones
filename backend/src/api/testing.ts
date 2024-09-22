import { Hono } from "hono";

import type { HonoVariables } from "@/utils/types";

const app = new Hono<{ Variables: HonoVariables }>();

app.get("/", function testingRoute(c) {
    return c.json({ message: "💀 Bones is live" });
});

export { app as testRouter };
