import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { orm } from "@/utils/db";

import { account } from "./account";

export const iamPermissionEnum = pgEnum("iam_permission_service_type", [
    "iam",
    "workspace",
]);

/**
 * TODO: This basic form of IAM permissions. Users (bones account/iam-user) can't create IAM
 * permission as of now. A list of IAM permissions will be provided to users that they can
 * that they can use to restrict (read, write). JSON column type for this will be a good choice
 */
export const iamPermission = pgTable(
    "iam_permissions",
    {
        id: orm.pk(),
        permissionId: orm.uuid("permission_id").unique(),

        name: varchar("name", { length: 255 }).notNull(),

        read: boolean("read").notNull().default(false),
        write: boolean("write").notNull().default(false),

        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),

        accountId: integer("account_id")
            .notNull()
            .references(() => account.id, { onDelete: "restrict" }),
    },
    function (table) {
        return {
            permissionId: index("iam_permission_id").on(table.permissionId),
            read: index("iam_permission_read").on(table.read),
            write: index("iam_permission_write").on(table.read),
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
    read: true,
    write: true,
    accountId: true,
    createdAt: true,
    updatedAt: true,
});

export type IAMPermissionClient = z.infer<typeof IAMPermissionClientSchema>;
