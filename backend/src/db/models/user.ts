import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    pgTable,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { orm } from "@/utils/db";

import { account } from "./account";

export const user = pgTable(
    "users",
    {
        id: orm.pk(),
        userId: orm.uuid("user_id").unique(),
        username: varchar("username", { length: 255 }).notNull(),

        isBlocked: boolean("is_blocked").notNull().default(false),

        passwordHash: varchar("password_hash", { length: 255 }).notNull(),
        passwordAge: orm.timestamp("password_age").notNull(),

        lastLoggedInAt: orm.timestamp("last_logged_in_at").notNull(),
        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),

        accountId: integer("account_id")
            .notNull()
            .references(() => account.id, { onDelete: "cascade" }), // When a account is deleted, delete the user
    },
    function (table) {
        return {
            userId: index("user_id").on(table.userId),
            username: index("user_username").on(table.username),
            accountId: index("user_account_id").on(table.accountId),
            usernameAccountIdUnique: uniqueIndex(
                "user_username_account_id_unique_index",
            ).on(table.username, table.accountId),
            usernameSearch: index("user_username_search_index").using(
                "gin",
                sql`to_tsvector('english', ${table.username})`,
            ),
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

export type NewUser = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;

export const UserSchema = createSelectSchema(user);
export const UserClientSchema = UserSchema.pick({
    userId: true,
    username: true,
    isBlocked: true,
    passwordAge: true,
    lastLoggedInAt: true,
    createdAt: true,
    updatedAt: true,
});

export type UserClient = z.infer<typeof UserClientSchema>;

export type UserPk = (typeof user.$inferSelect)["id"];
export type UserId = (typeof user.$inferSelect)["userId"];
