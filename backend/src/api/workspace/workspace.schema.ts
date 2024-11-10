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

// ===================================
// Exports
// ===================================

/** Workspace Open API Zod Schemas */
export const WorkspaceSchemas = {
    InitializeWorkspaceRequestBody,
    InitializeWorkspaceResponseBody,
};
