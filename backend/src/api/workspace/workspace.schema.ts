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
