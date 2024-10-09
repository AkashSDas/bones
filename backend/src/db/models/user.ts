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
            .references(() => account.id, { onDelete: "no action" }),
    },
    function (table) {
        return {
            userId: index().on(table.userId),
            username: index().on(table.username),
            accountId: index().on(table.accountId),
            usernameAccountIdUnique: uniqueIndex().on(table.username, table.accountId),
            usernameSearch: index().using(
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
    id: true,
    userId: true,
    username: true,
    accountId: true,
    isBlocked: true,
    passwordAge: true,
    lastLoggedInAt: true,
    createdAt: true,
    updatedAt: true,
});

export type UserClient = z.infer<typeof UserClientSchema>;
