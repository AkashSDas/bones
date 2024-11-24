import { createRoute } from "@hono/zod-openapi";

import { authenticate } from "@/middlewares/authenticate";
import { rbac } from "@/middlewares/rbac";
import { HttpErrorSchemas } from "@/schemas/http";
import { OpenApiResponses, status } from "@/utils/http";
import type { AppRouteHandler as Handler } from "@/utils/types";

import { WorkspaceSchemas } from "./workspace.schema";

const TAGS = {
    WORKSPACE: "Workspace",
} as const;

export const initializeWorkspace = createRoute({
    method: "post",
    path: "/initialize",
    tags: [TAGS.WORKSPACE],
    middleware: [authenticate, rbac.adminOnly],
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "Account initialized successfully",
            content: {
                "application/json": {
                    schema: WorkspaceSchemas.InitializeWorkspaceResponseBody,
                },
            },
        },
        [status.BAD_REQUEST]: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.BadRequestErrorSchema,
                },
            },
        },
    },
});

export const deinitializeWorkspace = createRoute({
    method: "delete",
    path: "/deinitialize",
    tags: [TAGS.WORKSPACE],
    middleware: [authenticate, rbac.adminOnly],
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.NO_CONTENT]: {
            description: `Account deinitialized successfully and in the process delete any workspace(s) that account has`,
        },
    },
});

export const createWorkspace = createRoute({
    method: "post",
    path: "/",
    tags: [TAGS.WORKSPACE],
    middleware: [authenticate, rbac.workspaceServiceWideWrite],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: WorkspaceSchemas.CreateWorkspaceRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.CREATED]: {
            description: "Workspace created",
            content: {
                "application/json": {
                    schema: WorkspaceSchemas.CreateWorkspaceResponseBody,
                },
            },
        },
    },
});

export const deleteWorkspace = createRoute({
    method: "delete",
    path: "/{workspaceId}",
    tags: [TAGS.WORKSPACE],
    middleware: [authenticate, rbac.workspaceServiceWideWrite],
    request: {
        params: WorkspaceSchemas.DeleteWorkspaceParams,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.NO_CONTENT]: {
            description: "Workspace delete",
        },
    },
});

// ===============================
// Types
// ===============================

export type WorkspaceHandler = {
    InitializeWorkspace: Handler<typeof initializeWorkspace>;
    DeinitializeWorkspace: Handler<typeof deinitializeWorkspace>;

    CreateWorkspace: Handler<typeof createWorkspace>;
    DeleteWorkspace: Handler<typeof deleteWorkspace>;
};
