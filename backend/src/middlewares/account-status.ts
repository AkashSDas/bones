import { createMiddleware } from "hono/factory";

import { ForbiddenError } from "@/utils/http";
import { type AppBindings } from "@/utils/types";

/** This middleware should be called after `authenticate` middleware. */
const allowOnlyActive = createMiddleware<AppBindings>(async function (c, next) {
    const account = c.get("account")!;
    if (account.status !== "active") {
        throw new ForbiddenError({ reason: "Account is not active" });
    }
    return next();
});

// ============================
// Export
// ============================

/** This middleware must be called after `authenticate` middleware. */
export const accountStatus = {
    allowOnlyActive,
};
