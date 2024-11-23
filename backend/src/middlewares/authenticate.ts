import { env } from "@/utils/env";

import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

import { dal } from "@/db/dal";
import { log } from "@/lib/logger";
import { auth } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/http";
import type { AppBindings } from "@/utils/types";

/**
 * Only validates whether user is authenticated or not. This also sets the account and user
 * objects to the context based on the requester (admin or user).
 *
 * If user or account are not found then it throws an unauthorized error. Also when account
 * id mismatch then it throws an unauthorized error.
 *
 * @throws {UnauthorizedError}
 **/
export const authenticate = createMiddleware<AppBindings>(async (c, next) => {
    const header = c.req.header("Authorization");

    if (typeof header !== "string") {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Missing 'Authorization' header",
        });
    }

    if (!header.startsWith("Bearer ")) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Authorization header missing 'Bearer'",
        });
    }

    const token = header.split("Bearer ")[1];

    if (typeof token !== "string") {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Invalid token",
        });
    }

    try {
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        const payload = await auth.extractJWTContent(decoded);

        if (payload === null) {
            throw new Error("Payload content is missing");
        }

        if (payload["type"] === "account") {
            c.set("accountJWTContent", payload);

            const account = await dal.account.findByAccountId(payload.accountId);

            if (account === null) {
                throw new UnauthorizedError({
                    message: "Unauthorized",
                    reason: "Account not found",
                });
            } else {
                c.set("account", account[1]);
                c.set("accountPk", account[0]);
                c.set("isAdmin", true);
            }
        } else if (payload["type"] === "user") {
            c.set("userJWTContent", payload);

            const [account, user] = await Promise.all([
                dal.account.findByAccountId(payload.accountId),
                dal.user.findById(payload.userId, payload.accountId),
            ]);

            if (user === null || account === null) {
                throw new UnauthorizedError({
                    message: "Unauthorized",
                    reason: "User not found",
                });
            } else {
                if (account[0] !== user[0]) {
                    throw new UnauthorizedError({
                        message: "Unauthorized",
                        reason: "Account mismatch",
                    });
                }

                c.set("account", account[1]);
                c.set("accountPk", account[0]);
                c.set("user", user[2]);
                c.set("userPk", user[0]);
                c.set("isAdmin", false);
            }
        } else {
            throw new Error(`Invalid payload type: ${payload["type"]}`);
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
