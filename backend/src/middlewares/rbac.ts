import { createMiddleware } from "hono/factory";

import { dal } from "@/db/dal";
import {
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
} from "@/utils/http";
import { AppBindings } from "@/utils/types";

type RBACType = "admin";

type RBACOptions = {
    type: RBACType;
};

/** This middleware should be called after `authenticate` middleware */
function rbac(opts: RBACOptions) {
    const { type } = opts;

    return createMiddleware<AppBindings>(async (c, next) => {
        const accountJWT = c.get("accountJWTContent");

        if (type === "admin") {
            if (accountJWT?.type !== "account") {
                throw new ForbiddenError({
                    message: "You don't account (admin) privileges",
                });
            }

            const account = await dal.account.findByAccountId(accountJWT.accountId);

            if (account === null) {
                throw new NotFoundError({ message: "Account doesn't exists" });
            }

            c.set("accountPk", account[0]);
            c.set("account", account[1]);

            return next();
        } else {
            throw new InternalServerError({
                message: "Internal Server Error",
                reason: `Unknown RBAC type: ${type}`,
            });
        }
    });
}

const rbacAdmin = rbac({ type: "admin" });

export { rbacAdmin };
