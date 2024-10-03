import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { orm } from "@/utils/db";

import { account } from "./account";

export const user = pgTable(
    "users",
    {
        id: orm.pk(),
        userId: orm.uuid("user_id").unique(),
        username: varchar("username", { length: 255 }).notNull().unique(),

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
