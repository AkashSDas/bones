import { relations, sql } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { orm } from "@/utils/db";

import { account } from "./account";
import { user } from "./user";

export const workspace = pgTable(
    "workspaces",
    {
        id: orm.pk(),

        /**
         * This workspace ID will act as public facing workspace ID as well as this ID will
         * be used for creating workspace (pod, service, ingress) and will be part of workspace
         * URL which will be used to manage a workspace
         **/
        workspaceId: orm.uuid("workspace_id").unique(),

        name: varchar("name", { length: 255 }).notNull(),

        // Container image for workspace related info
        containerImage: varchar("container_image", { length: 255 }).notNull(),
        containerImageTag: varchar("container_image_tag", { length: 255 }).notNull(),

        createdAt: orm.timestamp("created_at").notNull().defaultNow(),
        updatedAt: orm.timestamp("updated_at").notNull().defaultNow(),

        // Don't allow account delete if it has any workspace associated to it
        accountId: integer("account_id")
            .notNull()
            .references(() => account.id, { onDelete: "restrict" }), // Prevent account deletion if there are any workspaces associated with it

        // This will be null when account is created by an account directly
        createdByUserId: integer("created_by_user_id").references(() => user.id, {
            onDelete: "set null", // When a user is deleted, set the user id to null
        }),
    },
    function (table) {
        return {
            workspaceId: index("workspace_id").on(table.workspaceId),
            accountId: index("workspace_account_id").on(table.accountId),
            createdByUserId: index("workspace_created_by_user_id").on(table.accountId),
            nameSearch: index("workspace_name_search_index").using(
                "gin",
                sql`to_tsvector('english', ${table.name})`,
            ),
        };
    },
);

export const workspaceRelations = relations(workspace, function ({ one }) {
    return {
        account: one(account, {
            fields: [workspace.accountId],
            references: [account.id],
        }),
    };
});

export type NewWorkspace = typeof workspace.$inferInsert;
export type Workspace = typeof workspace.$inferSelect;

export const WorkspaceSchema = createSelectSchema(workspace);
export const WorkspaceClientSchema = WorkspaceSchema.pick({
    workspaceId: true,
    name: true,
    accountId: true,
    containerImage: true,
    containerImageTag: true,
    createdAt: true,
    updatedAt: true,
    createdByUserId: true,
});

export type WorkspaceClient = z.infer<typeof WorkspaceClientSchema>;
