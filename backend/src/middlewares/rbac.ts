import { createMiddleware } from "hono/factory";

import { RBACValidator } from "@/utils/rbac";
import { type AppBindings } from "@/utils/types";

const adminOnly = createMiddleware<AppBindings>(async function (c, next) {
    const rbac = new RBACValidator(c);
    rbac.validateAdminOnly();
    return next();
});

// ============================
// IAM
// ============================

const iamAccountWideRead = createMiddleware<AppBindings>(async function (c, next) {
    const rbac = new RBACValidator(c);
    rbac.validateIAMAccountWideAccess({ read: true, write: false });
    return next();
});

const iamAccountWideWrite = createMiddleware<AppBindings>(async function (c, next) {
    const rbac = new RBACValidator(c);
    rbac.validateIAMAccountWideAccess({ read: false, write: true });
    return next();
});

// ============================
// Workspace
// ============================

const workspaceAccountWideRead = createMiddleware<AppBindings>(
    async function (c, next) {
        const rbac = new RBACValidator(c);
        rbac.validateWorkspaceAccountWideAccess({ read: true, write: false });
        return next();
    },
);

const workspaceAccountWideWrite = createMiddleware<AppBindings>(
    async function (c, next) {
        const rbac = new RBACValidator(c);
        rbac.validateWorkspaceAccountWideAccess({ read: false, write: true });
        return next();
    },
);

// ============================
// Export
// ============================

/** This middleware must be called after `authenticate` and `accountStatus` (if present) middleware. */
export const rbac = {
    adminOnly,

    iamAccountWideRead: iamAccountWideRead,
    iamAccountWideWrite: iamAccountWideWrite,

    workspaceAccountWideRead: workspaceAccountWideRead,
    workspaceAccountWideWrite: workspaceAccountWideWrite,
};
