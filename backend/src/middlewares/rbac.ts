import { createMiddleware } from "hono/factory";

import { RBACValidator } from "@/utils/rbac";
import { type AppBindings } from "@/utils/types";

/** This middleware should be called after `authenticate` middleware. */
export const rbacAdminOnly = createMiddleware<AppBindings>(async function (c, next) {
    const rbac = new RBACValidator(c);
    rbac.validateAdminOnly();
    return next();
});

// ============================
// IAM
// ============================

/** This middleware should be called after `authenticate` middleware. */
export const rbacIAMServiceWideRead = createMiddleware<AppBindings>(
    async function (c, next) {
        const rbac = new RBACValidator(c);
        rbac.validateIAMServiceWide({ read: true, write: false });
        return next();
    },
);

/** This middleware should be called after `authenticate` middleware. */
export const rbacIAMServiceWideWrite = createMiddleware<AppBindings>(
    async function (c, next) {
        const rbac = new RBACValidator(c);
        rbac.validateIAMServiceWide({ read: false, write: true });
        return next();
    },
);
