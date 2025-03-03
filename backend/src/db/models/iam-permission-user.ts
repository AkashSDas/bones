import { relations } from "drizzle-orm";
import { index, integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

import { orm } from "@/utils/db";

import { iamPermission } from "./iam-permission";
import { user } from "./user";

export const IAM_PERMISSION_ACCESS_TYPE = {
    READ: "read",
    WRITE: "write",
} as const;

export type IAMPermissionAccessType =
    (typeof IAM_PERMISSION_ACCESS_TYPE)[keyof typeof IAM_PERMISSION_ACCESS_TYPE];

export const iamPermissionAccessTypeEnum = pgEnum("iam_permission_access_type", [
    IAM_PERMISSION_ACCESS_TYPE.READ,
    IAM_PERMISSION_ACCESS_TYPE.WRITE,
]);

export const iamPermissionUser = pgTable(
    "iam_permission_users",
    {
        id: orm.pk(),

        permissionId: integer("permission_id")
            .notNull()
            .references(() => iamPermission.id, { onDelete: "cascade" }),
        userId: integer("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        accessType: iamPermissionAccessTypeEnum("access_type").notNull(),

        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),
    },
    function (table) {
        return {
            permissionId: index("iam_permission_user_permission_id").on(
                table.permissionId,
            ),
            userId: index("iam_permission_user_user_id").on(table.userId),
        };
    },
);

export const iamPermissionUserRelations = relations(
    iamPermissionUser,
    function ({ one }) {
        return {
            permission: one(iamPermission, {
                fields: [iamPermissionUser.permissionId],
                references: [iamPermission.id],
            }),
            user: one(user, {
                fields: [iamPermissionUser.userId],
                references: [user.id],
            }),
        };
    },
);

export type NewIAMPermissionUser = typeof iamPermissionUser.$inferInsert;
export type IAMPermissionUser = typeof iamPermissionUser.$inferSelect;

export const IAMPermissionUserSchema = createSelectSchema(iamPermissionUser);

export type IAMPermissionUserPk = (typeof iamPermissionUser.$inferSelect)["id"];
