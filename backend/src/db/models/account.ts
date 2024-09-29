import { relations } from "drizzle-orm";
import { boolean, index, pgTable, varchar } from "drizzle-orm/pg-core";

import { orm } from "@/utils/db";

import { user } from "./user";

export const account = pgTable(
    "accounts",
    {
        // Basic info
        id: orm.pk(),
        accountId: orm.ulid("account_id").unique(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        accountName: varchar("account_name", { length: 255 })
            .notNull()
            .unique(),

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
            accountId: index().on(table.accountId),
            email: index().on(table.email),
            accountName: index().on(table.accountName),
        };
    },
);

export const accountRelations = relations(account, function ({ many }) {
    return {
        users: many(user),
    };
});
