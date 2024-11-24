import { z } from "@hono/zod-openapi";

import { IAMPermissionClientSchema, IAM_SERVICE } from "@/db/models/iam-permission";
import { UserClientSchema } from "@/db/models/user";

// ===================================
// Get Many IAM Permissions
// ===================================

const GetManyIAMPermissionsQuery = z.object({
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
        .openapi({ description: "Search query by policy name" }),
});

const GetManyIAMPermissionsResponseBody = z.object({
    total: z
        .number()
        .int()
        .min(0)
        .openapi({ description: "Total number of IAM permissions" }),
    permissions: z
        .array(
            IAMPermissionClientSchema.merge(
                z.object({
                    users: z.array(UserClientSchema),
                }),
            ),
        )
        .openapi({ description: "List of IAM permissions" }),
});

// ===================================
// Get IAM Permission
// ===================================

const GetIAMPermissionParams = z.object({
    permissionId: z.string().uuid().openapi({ description: "IAM permission ID" }),
});

const GetIAMPermissionResponseBody = z.object({
    permission: IAMPermissionClientSchema.merge(
        z.object({
            users: z.array(UserClientSchema),
        }),
    ),
});

// ===================================
// Update IAM Permission
// ===================================

const UpdateIAMPermissionParams = z.object({
    permissionId: z.string().uuid().openapi({ description: "IAM permission ID" }),
});

const UpdateIAMPermissionRequestBody = z.object({
    name: z
        .string()
        .min(3)
        .max(255)
        .openapi({ description: "Name of the IAM permission" }),
    readAll: z.boolean().optional().openapi({ description: "Read all flag" }),
    writeAll: z.boolean().optional().openapi({ description: "Write all flag" }),
    changeUsers: z
        .object({
            permissionType: z
                .enum(["read", "write"])
                .openapi({ description: "Permission type" }),
            changeType: z
                .enum(["add", "remove"])
                .openapi({ description: "Change type" }),
            userIds: z.array(z.string().uuid()).openapi({ description: "User IDs" }),
        })
        .optional()
        .openapi({ description: "Data to change users" }),
});

const UpdateIAMPermissionResponseBody = z.object({
    permission: IAMPermissionClientSchema.merge(
        z.object({
            users: z.array(UserClientSchema),
        }),
    ),
});

// ===================================
// Exports
// ===================================

/** IAM Permission Open API Zod Schemas */
export const IAMPermissionSchemas = {
    GetManyIAMPermissionsQuery,
    GetManyIAMPermissionsResponseBody,

    GetIAMPermissionParams,
    GetIAMPermissionResponseBody,

    UpdateIAMPermissionParams,
    UpdateIAMPermissionRequestBody,
    UpdateIAMPermissionResponseBody,
};
