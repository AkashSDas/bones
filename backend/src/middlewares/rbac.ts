import { createMiddleware } from "hono/factory";

import { RBACValidator } from "@/utils/rbac";
import { type AppBindings } from "@/utils/types";

type RBAC = "adminOnly";

/**
 * This middleware is responsible for validating the RBAC for the incoming request.
 * This middleware should be called after `authenticate` middleware.
 **/
function rbac({ type }: { type: RBAC }) {
    return createMiddleware<AppBindings>(async function (c, next) {
        const rbac = new RBACValidator(c);

        switch (type) {
            case "adminOnly": {
                rbac.validateAdminOnly();
                return next();
            }
            default: {
                return next();
            }
        }
    });
}

const rbacAdminOnly = rbac({ type: "adminOnly" });

export { rbacAdminOnly };
