import type { Context, Next } from "hono";
import { v7 as uuid } from "uuid";

/** Middleware for setting up correlation ID */
export async function correlationId(c: Context, next: Next): Promise<void> {
    const correlationId = c.req.header("X-Correlation-ID") ?? uuid();
    c.header("X-Correlation-ID", correlationId);
    c.set("correlationId", correlationId);

    await next();
}
