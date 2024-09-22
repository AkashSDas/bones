import type { Context, Next } from "hono";
import { ulid } from "ulid";

/** Middleware for setting up correlation ID */
export async function correlationIdMiddleware(c: Context, next: Next) {
    const correlationId = c.req.header("X-Correlation-ID") ?? ulid();
    c.header("X-Correlation-ID", correlationId);
    c.set("correlationId", correlationId);

    await next();
}
