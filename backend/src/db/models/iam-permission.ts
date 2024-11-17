import { relations, sql } from "drizzle-orm";
import { index, integer, jsonb, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { orm } from "@/utils/db";

import { account } from "./account";

export const iamPermissionEnum = pgEnum("iam_permission_service_type", [
    "iam",
    "workspace",
]);

export const iamPermission = pgTable(
    "iam_permissions",
    {
        id: orm.pk(),
        permissionId: orm.uuid("permission_id").unique(),

        name: varchar("name", { length: 255 }).notNull(),
        policy: jsonb("policy"),

        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),

        accountId: integer("account_id")
            .notNull()
            .references(() => account.id, { onDelete: "restrict" }),
    },
    function (table) {
        return {
            permissionId: index("iam_permission_id").on(table.permissionId),
            nameSearch: index("iam_permission_name_search_index").using(
                "gin",
                sql`to_tsvector('english', ${table.name})`,
            ),
        };
    },
);

export const iamPermissionRelations = relations(iamPermission, function ({ many }) {
    return {
        iamPermissions: many(iamPermission),
    };
});

export type NewIAMPermission = typeof iamPermission.$inferInsert;
export type IAMPermission = typeof iamPermission.$inferSelect;

export const IAMPermissionSchema = createSelectSchema(iamPermission);
export const IAMPermissionClientSchema = IAMPermissionSchema.pick({
    name: true,
    permissionId: true,
    policy: true,
    accountId: true,
    createdAt: true,
    updatedAt: true,
});

export type IAMPermissionClient = z.infer<typeof IAMPermissionClientSchema>;
