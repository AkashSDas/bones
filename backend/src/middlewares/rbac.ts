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

const iamServiceWideRead = createMiddleware<AppBindings>(async function (c, next) {
    const rbac = new RBACValidator(c);
    rbac.validateIAMServiceWide({ read: true, write: false });
    return next();
});

const iamServiceWideWrite = createMiddleware<AppBindings>(async function (c, next) {
    const rbac = new RBACValidator(c);
    rbac.validateIAMServiceWide({ read: false, write: true });
    return next();
});

// ============================
// Workspace
// ============================

const workspaceServiceWideRead = createMiddleware<AppBindings>(
    async function (c, next) {
        const rbac = new RBACValidator(c);
        rbac.validateWorkspaceServiceWide({ read: true, write: false });
        return next();
    },
);

const workspaceServiceWideWrite = createMiddleware<AppBindings>(
    async function (c, next) {
        const rbac = new RBACValidator(c);
        rbac.validateWorkspaceServiceWide({ read: false, write: true });
        return next();
    },
);

// ============================
// Export
// ============================

/** This middleware must be called after `authenticate` and `accountStatus` (if present) middleware. */
export const rbac = {
    adminOnly,

    iamServiceWideRead,
    iamServiceWideWrite,

    workspaceServiceWideRead,
    workspaceServiceWideWrite,
};
