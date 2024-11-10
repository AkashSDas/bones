import { Hono } from "hono";

import { status } from "@/utils/http";
import type { AppBindings } from "@/utils/types";

const app = new Hono<AppBindings>();

app.get("/", function pingRoute(c) {
    return c.json({ message: "💀 Bones is live" }, status.OK);
});

export { app as pingRouter };
