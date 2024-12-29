import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { orm } from "@/utils/db";

import { account } from "./account";
import { workspace } from "./workspace";

export const IAM_SERVICE = {
    IAM: "iam",
    WORKSPACE: "workspace",
} as const;

export type IAMService = (typeof IAM_SERVICE)[keyof typeof IAM_SERVICE];

export const iamServicePermissionEnum = pgEnum("iam_permission_service_type", [
    IAM_SERVICE.IAM,
    IAM_SERVICE.WORKSPACE,
]);

/**
 * Service wide policy will have all the service ids as `NONE`.
 *
 * IAM service won't have any scoped permission like workspace service. For example, in
 * each workspace will have a policy associated with it but there's no such thing in
 * IAM service.
 */
export const iamPermission = pgTable(
    "iam_permissions",
    {
        id: orm.pk(),
        permissionId: orm.uuid("permission_id").unique(),

        name: varchar("name", { length: 255 }).notNull(),
        serviceType: iamServicePermissionEnum("service_type").notNull(),
        isServiceWide: boolean("is_service_wide").notNull().default(false),

        readAll: boolean("read_all").notNull().default(false),
        writeAll: boolean("write_all").notNull().default(false),

        workspaceId: integer("workspace_id").references(() => workspace.id, {
            onDelete: "cascade", // When a workspace is deleted, delete the permission
        }),

        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),

        accountId: integer("account_id")
            .notNull()
            .references(() => account.id, { onDelete: "cascade" }), // When a account is deleted, delete the permission
    },
    function (table) {
        return {
            permissionId: index("iam_permission_id").on(table.permissionId),
            serviceType: index("iam_service_type").on(table.serviceType),
            workspaceId: index("iam_workspace_id").on(table.workspaceId),
            nameSearch: index("iam_permission_name_search_index").using(
                "gin",
                sql`to_tsvector('english', ${table.name})`,
            ),
        };
    },
);

export const iamPermissionRelations = relations(iamPermission, function ({ one }) {
    return {
        account: one(account, {
            fields: [iamPermission.accountId],
            references: [account.id],
        }),
        workspace: one(workspace, {
            fields: [iamPermission.workspaceId],
            references: [workspace.id],
        }),
    };
});

export type NewIAMPermission = typeof iamPermission.$inferInsert;
export type IAMPermission = typeof iamPermission.$inferSelect;

export const IAMPermissionSchema = createSelectSchema(iamPermission);
export const IAMPermissionClientSchema = IAMPermissionSchema.pick({
    name: true,
    permissionId: true,
    serviceType: true,
    isServiceWide: true,
    readAll: true,
    writeAll: true,
    createdAt: true,
    updatedAt: true,
});

export type IAMPermissionClient = z.infer<typeof IAMPermissionClientSchema>;

export type IAMPermissionPk = (typeof iamPermission.$inferSelect)["id"];
export type IAMPermissionId = (typeof iamPermission.$inferSelect)["permissionId"];
