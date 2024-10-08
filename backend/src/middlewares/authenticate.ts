import { env } from "@/utils/env";

import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

import { auth } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/http";
import type { AppBindings } from "@/utils/types";

export const authenticateMiddleware = createMiddleware<AppBindings>(async (c, next) => {
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
        const payload = await auth.getAccessTokenContent(decoded);

        if (payload === null) {
            throw new Error("Payload content is missing");
        } else {
            c.set("jwtContent", payload);
        }
    } catch (e) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Invalid or expired access token",
        });
    }

    await next();
});
