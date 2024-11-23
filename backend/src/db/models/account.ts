import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { orm } from "@/utils/db";

import { iamPermission } from "./iam-permission";
import { user } from "./user";
import { workspace } from "./workspace";

// Enums needs to be exported to create them in migrations
// Manually had to add enum since drizzle kit is not being able to detect enums
// https://github.com/drizzle-team/drizzle-orm/issues/2389
export const accountStatusEnum = pgEnum("account_status", [
    "uninitialized",
    "active",
    "suspended",
    "deactive",
]);

export const account = pgTable(
    "accounts",
    {
        // Basic info
        id: orm.pk(),
        accountId: orm.uuid("account_id").unique(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        accountName: varchar("account_name", { length: 255 }).notNull().unique(),

        // Account status related fields
        status: accountStatusEnum("status").notNull().default("uninitialized"),
        changeStatusToken: varchar("change_status_token", { length: 255 }),
        changeStatusTokenAge: orm.timestamp("change_status_token_age"),

        // Password related fields
        passwordHash: varchar("password_hash", { length: 255 }).notNull(),
        passwordAge: orm.timestamp("password_age").notNull(),
        forgotPasswordToken: varchar("forgot_password_token", { length: 255 }),
        forgotPasswordTokenAge: orm.timestamp("forgot_password_token_age"),

        // Account verification related fields
        isVerified: boolean("is_verified").notNull().default(false),
        verificationToken: varchar("verification_token", { length: 255 }),
        verificationTokenAge: orm.timestamp("verification_token_age"),
        lastVerifiedAt: orm.timestamp("last_verified_at"),

        // Account activity info
        lastLoggedInAt: orm.timestamp("last_logged_in_at").notNull(),
        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),
    },
    function (table) {
        return {
            accountId: index("account_id").on(table.accountId),
            email: index("account_email").on(table.email),
            accountName: index("account_name").on(table.accountName),
        };
    },
);

export const accountRelations = relations(account, function ({ many }) {
    return {
        users: many(user),
        iamPermissions: many(iamPermission),
        workspaces: many(workspace),
    };
});

export type NewAccount = typeof account.$inferInsert;
export type Account = typeof account.$inferSelect;

export const AccountSchema = createSelectSchema(account);
export const AccountClientSchema = AccountSchema.pick({
    accountId: true,
    email: true,
    accountName: true,
    status: true,
    passwordAge: true,
    isVerified: true,
    lastVerifiedAt: true,
    lastLoggedInAt: true,
    createdAt: true,
    updatedAt: true,
});

export type AccountClient = z.infer<typeof AccountClientSchema>;
