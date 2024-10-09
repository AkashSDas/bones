import { env } from "@/utils/env";

import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

import { log } from "@/lib/logger";
import { auth } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/http";
import type { AppBindings } from "@/utils/types";

export const authenticate = createMiddleware<AppBindings>(async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader === undefined) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Missing 'Authorization' header",
        });
    }

    if (authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Authorization header missing 'Bearer'",
        });
    }

    const accessToken = authHeader.split("Bearer ")[1] ?? "-";

    if (accessToken === "-") {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Invalid 'Authorization' bearer token",
        });
    }

    try {
        const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
        const payload = await auth.extractJWTContent(decoded);

        if (payload === null) {
            throw new Error("Payload content is missing");
        } else {
            if (payload["type"] === "account") {
                c.set("accountJWTContent", payload);
            } else if (payload["type"] === "user") {
                c.set("userJWTContent", payload);
            } else {
                throw new Error(`Invalid payload type: ${payload["type"]}`);
            }
        }
    } catch (e) {
        log.error(`Failed to verify access token: ${e}`);
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Invalid or expired access token",
        });
    }

    await next();
});
