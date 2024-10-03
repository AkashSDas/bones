import type { Context, Next } from "hono";
import { v7 as uuid } from "uuid";

/** Middleware for setting up correlation ID */
export async function correlationIdMiddleware(c: Context, next: Next) {
    const correlationId = c.req.header("X-Correlation-ID") ?? uuid();
    c.header("X-Correlation-ID", correlationId);
    c.set("correlationId", correlationId);

    await next();
}
