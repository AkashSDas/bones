import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    pgTable,
    serial,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { account } from "./account";

/**
 * User table:
 * ------------------------------
 *
 * ```text
 * id: int, pk
 * user_id: uuid, unique, index
 * username: varchar, index (unique per account)
 *
 * password_hash: varchar
 * password_age: timestamp
 *
 * is_blocked: bool
 *
 * last_logged_in_at: timestamp
 * created_at: timestamp
 * updated_at: timestamp
 * ```
 */
export const user = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        userId: uuid("user_id")
            .$defaultFn(() => ulid())
            .notNull()
            .unique(),
        username: varchar("username", { length: 255 }).notNull(),

        passwordHash: varchar("password_hash", { length: 255 }).notNull(),
        passwordAge: timestamp("password_age", {
            withTimezone: true,
            mode: "string",
        }).notNull(),

        isBlocked: boolean("is_blocked").notNull().default(false),

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

        accountId: integer("account_id")
            .notNull()
            .references(() => account.id),
    },
    function (table) {
        return {
            userId: index().on(table.userId),
        };
    },
);

export const userRelations = relations(user, function ({ one }) {
    return {
        account: one(account, {
            fields: [user.accountId],
            references: [account.id],
        }),
    };
});
