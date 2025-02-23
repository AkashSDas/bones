import { createRoute } from "@hono/zod-openapi";

import { authenticate } from "@/middlewares/authenticate";
import { rbac } from "@/middlewares/rbac";
import { OpenApiResponses, status } from "@/utils/http";
import type { AppRouteHandler as Handler } from "@/utils/types";

import { IAMPermissionSchemas } from "./iam-permission.schema";

const TAGS = {
    IAM_PERMISSION: "IAM Permission",
} as const;

// ===================================
// IAM Permissions
// ===================================

export const getIAMPermissions = createRoute({
    method: "get",
    path: "/",
    tags: [TAGS.IAM_PERMISSION],
    middleware: [authenticate, rbac.iamAccountWideRead],
    request: {
        query: IAMPermissionSchemas.GetManyIAMPermissionsQuery,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMPermissionSchemas.GetManyIAMPermissionsResponseBody,
                },
            },
        },
    },
});

export const getIAMPermission = createRoute({
    method: "get",
    path: "/{permissionId}",
    tags: [TAGS.IAM_PERMISSION],
    middleware: [authenticate, rbac.iamAccountWideRead],
    request: {
        params: IAMPermissionSchemas.GetIAMPermissionParams,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "IAM permission fetched successfully",
            content: {
                "application/json": {
                    schema: IAMPermissionSchemas.GetIAMPermissionResponseBody,
                },
            },
        },
    },
});

export const updateIAMPermission = createRoute({
    method: "patch",
    path: "/{permissionId}",
    tags: [TAGS.IAM_PERMISSION],
    middleware: [authenticate, rbac.iamAccountWideWrite],
    request: {
        params: IAMPermissionSchemas.UpdateIAMPermissionParams,
        body: {
            content: {
                "application/json": {
                    schema: IAMPermissionSchemas.UpdateIAMPermissionRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "IAM permission updated successfully",
            content: {
                "application/json": {
                    schema: IAMPermissionSchemas.UpdateIAMPermissionResponseBody,
                },
            },
        },
    },
});

// ===============================
// Types
// ===============================

export type IAMPermissionHandler = {
    GetIAMPermissions: Handler<typeof getIAMPermissions>;
    GetIAMPermission: Handler<typeof getIAMPermission>;
    UpdateIAMPermission: Handler<typeof updateIAMPermission>;
};
