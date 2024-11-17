import { z } from "@hono/zod-openapi";

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
    /** Keeping these as "enum" due to low number of available workspaces */
    workspaceImage: z.enum([
        "workspace:go1.23",
        "workspace:python3.13",
        "workspace:vite-react18",
        "workspace:hono4.6-deno2.0",
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
};
