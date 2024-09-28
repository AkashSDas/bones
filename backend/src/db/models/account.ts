import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    pgTable,
    serial,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { user } from "./user";

/**
 * Account table:
 * -------------------------------------
 *
 * ```text
 * id: int, pk
 * account_id: uuid, unique, index
 * email: varchar, unique, index
 * account_name: varchar, unique, index
 *
 * password_hash: varchar
 * password_age: timestamp
 * forgot_password_token: varchar, null
 * forgot_password_token_age: timestamp, null
 *
 * is_verifed: bool
 * verification_token: varchar
 * verification_token_age: timestamp
 *
 * last_logged_in_at: timestamp
 * created_at: timestamp
 * updated_at: timestamp
 * ```
 *
 * 1..* with user table
 */
export const account = pgTable(
    "accounts",
    {
        id: serial("id").primaryKey(),
        accountId: uuid("account_id")
            .$defaultFn(() => ulid())
            .notNull()
            .unique(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        accountName: varchar("account_name", { length: 255 })
            .notNull()
            .unique(),

        passwordHash: varchar("password_hash", { length: 255 }).notNull(),
        passwordAge: timestamp("password_age", {
            withTimezone: true,
            mode: "string",
        }).notNull(),
        forgotPasswordToken: varchar("forgot_password_token", { length: 255 }),
        forgotPasswordTokenAge: timestamp("forgot_password_token_age", {
            withTimezone: true,
            mode: "string",
        }),

        isVerified: boolean("is_verified").notNull().default(false),
        verificationToken: varchar("verification_token", { length: 255 }),
        verificationTokenAge: timestamp("verification_token_age", {
            withTimezone: true,
            mode: "string",
        }),

        lastLoggedInAt: timestamp("last_logged_in_at", {
            withTimezone: true,
            mode: "string",
        }).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        })
            .notNull()
            .defaultNow(),
    },
    function (table) {
        return {
            accountId: index().on(table.accountId),
        };
    },
);

export const accountRelations = relations(account, function ({ many }) {
    return {
        users: many(user),
    };
});
