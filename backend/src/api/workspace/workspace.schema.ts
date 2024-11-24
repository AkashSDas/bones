import { z } from "@hono/zod-openapi";

import { WorkspaceClientSchema } from "@/db/models/workspace";

// ===============================================
// Initialize Workspace feature for Account
// ===============================================

const InitializeWorkspaceRequestBody = z.object({});

const InitializeWorkspaceResponseBody = z.object({
    message: z
        .string()
        .min(8)
        .max(255)
        .openapi({ example: "Account now has workspace feature available" }),
});

// ===============================================
// Create New Workspace
// ===============================================

const CreateWorkspaceRequestBody = z.object({
    name: z.string(),
    containerImage: z.enum(["workspace"]),
    /** Keeping these as "enum" due to low number of available workspaces */
    containerImageTag: z.enum([
        "go1.23",
        "python3.13",
        "vite-react18",
        "hono4.6-deno2.0",
    ]),
});

const CreateWorkspaceResponseBody = z.object({
    workspaceURL: z.string().url().openapi({ example: "Workspace URL" }),
});

// ===============================================
// Delete Workspace
// ===============================================

const DeleteWorkspaceParams = z.object({
    workspaceId: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426655440000" }),
});

// ===============================================
// Get Workspace
// ===============================================

const GetWorkspaceParams = z.object({
    workspaceId: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426655440000" }),
});

const GetWorkspaceResponseBody = z.object({
    workspace: WorkspaceClientSchema.openapi({ description: "Workspace details" }),
});

// ===============================================
// Get Workspaces
// ===============================================

const GetWorkspacesQuery = z.object({
    offset: z
        .string()
        .transform((v) => {
            const page = parseInt(v, 10);
            if (isNaN(page) || page < 0) {
                throw new Error(`Invalid page value: ${v}`);
            }

            return page;
        })
        .default("0")
        .openapi({ description: "Page number" }),
    limit: z
        .string()
        .transform((v) => {
            const limit = parseInt(v, 10);
            if (isNaN(limit) || limit < 0) {
                throw new Error(`Invalid limit value: ${v}`);
            }

            return limit;
        })
        .default("20")
        .openapi({ description: "Page size" }),
    search: z
        .string()
        .min(3)
        .optional()
        .openapi({ description: "Search query by workspace name" }),
});

const GetWorkspacesResponseBody = z.object({
    workspaces: z.array(WorkspaceClientSchema).openapi({
        description: "List of workspaces",
    }),
    total: z
        .number()
        .int()
        .min(0)
        .openapi({ description: "Total number of workspaces" }),
});

// ===============================================
// Update Workspaces
// ===============================================

const UpdateWorkspaceParams = z.object({
    workspaceId: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426655440000" }),
});

const UpdateWorkspaceRequestBody = z.object({
    name: z.string().optional(),
});

const UpdateWorkspaceResponseBody = z.object({
    workspace: WorkspaceClientSchema.openapi({ description: "Updated workspace" }),
});

// ===================================
// Exports
// ===================================

/** Workspace Open API Zod Schemas */
export const WorkspaceSchemas = {
    InitializeWorkspaceRequestBody,
    InitializeWorkspaceResponseBody,

    CreateWorkspaceRequestBody,
    CreateWorkspaceResponseBody,

    DeleteWorkspaceParams,

    GetWorkspaceParams,
    GetWorkspaceResponseBody,

    GetWorkspacesQuery,
    GetWorkspacesResponseBody,

    UpdateWorkspaceParams,
    UpdateWorkspaceRequestBody,
    UpdateWorkspaceResponseBody,
};
