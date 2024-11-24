import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { WorkspaceSchemas } from "@/api/workspace/workspace.schema";

import { type DB, type TransactionCtx, db } from "..";
import { iamPermission, workspace } from "../models";
import { type AccountPk } from "../models/account";
import { IAMPermission, IAM_SERVICE } from "../models/iam-permission";
import {
    type IAMPermissionUser,
    iamPermissionUser,
} from "../models/iam-permission-user";
import { type UserPk } from "../models/user";
import type {
    Workspace,
    WorkspaceClient,
    WorkspaceId,
    WorkspacePk,
} from "../models/workspace";
import { BaseDAL } from "./base";

class WorkspaceDAL extends BaseDAL {
    constructor(db: DB) {
        super(db);
    }

    // ===========================
    // Update
    // ===========================

    async update(
        accountId: AccountPk,
        workspaceId: WorkspacePk,
        body: z.infer<typeof WorkspaceSchemas.UpdateWorkspaceRequestBody>,
    ): Promise<WorkspaceClient> {
        const result = await this.db
            .update(workspace)
            .set(body)
            .where(
                and(eq(workspace.accountId, accountId), eq(workspace.id, workspaceId)),
            )
            .returning();

        return result[0];
    }

    // ===========================
    // Find
    // ===========================

    async findById(
        accountId: AccountPk,
        workspaceId: WorkspaceId,
    ): Promise<[WorkspacePk, WorkspaceClient] | null> {
        const result = await this.db
            .select()
            .from(workspace)
            .where(
                and(
                    eq(workspace.accountId, accountId),
                    eq(workspace.workspaceId, workspaceId),
                ),
            )
            .limit(1);

        return result.length > 0 ? [result[0].id, result[0]] : null;
    }

    async find(
        accountId: AccountPk,
        search: string | undefined = undefined,
        limit: number = 20,
        offset: number = 0,
    ): Promise<{ workspaces: Workspace[]; totalCount: number }> {
        let totalCountQuery;
        let workspacesQuery;

        if (search !== undefined) {
            const searchCondition = sql`to_tsvector('english', ${workspace.name}) @@ to_tsquery('english', ${search})`;

            totalCountQuery = this.db
                .select({ count: sql<number>`COUNT(*)` })
                .from(workspace)
                .where(and(eq(workspace.accountId, accountId), searchCondition));

            workspacesQuery = this.db
                .select()
                .from(workspace)
                .where(and(eq(workspace.accountId, accountId), searchCondition))
                .orderBy(asc(workspace.name))
                .limit(limit)
                .offset(offset);
        } else {
            totalCountQuery = this.db
                .select({ count: sql<number>`COUNT(*)` })
                .from(workspace)
                .where(eq(workspace.accountId, accountId));

            workspacesQuery = this.db
                .select()
                .from(workspace)
                .where(eq(workspace.accountId, accountId))
                .orderBy(asc(workspace.name))
                .limit(limit)
                .offset(offset);
        }

        const [totalCountResult, workspacesResult] = await Promise.all([
            totalCountQuery.then((r) => r[0].count),
            workspacesQuery.then((r) => r),
        ]);

        return {
            workspaces: workspacesResult,
            totalCount: totalCountResult,
        };
    }

    // ===========================
    // Create
    // ===========================

    async create(
        accountPk: AccountPk,
        body: z.infer<typeof WorkspaceSchemas.CreateWorkspaceRequestBody>,
        userPk: UserPk | null = null,
    ): Promise<{
        workspace: Workspace;
        permission: IAMPermission;
        userPermission: IAMPermissionUser | null;
    }> {
        return await this.db.transaction(async function (tx) {
            const newWorkspace = await tx
                .insert(workspace)
                .values({
                    name: body.name,
                    accountId: accountPk,
                    containerImage: body.containerImage,
                    containerImageTag: body.containerImageTag,
                })
                .returning();

            const perm = await tx
                .insert(iamPermission)
                .values({
                    name: `Workspace ${body.name} Policy`,
                    serviceType: IAM_SERVICE.WORKSPACE,
                    isServiceWide: false,
                    readAll: false,
                    writeAll: false,
                    accountId: accountPk,
                    workspaceId: newWorkspace[0].id,
                })
                .returning();

            const userPerm = userPk
                ? await tx
                      .insert(iamPermissionUser)
                      .values({
                          userId: userPk,
                          permissionId: perm[0].id,
                          accessType: "write",
                      })
                      .returning()
                : null;

            return {
                workspace: newWorkspace[0],
                permission: perm[0],
                userPermission: userPerm?.[0] ?? null,
            };
        });
    }

    // ===========================
    // Find
    // ===========================

    async findByWorkspaceId(
        workspaceId: WorkspaceId,
    ): Promise<[AccountPk, WorkspacePk, WorkspaceClient] | null> {
        const result = await this.db
            .select({
                id: workspace.id,
                workspaceId: workspace.workspaceId,
                name: workspace.name,
                containerImage: workspace.containerImage,
                containerImageTag: workspace.containerImageTag,
                accountId: workspace.accountId,
                createdAt: workspace.createdAt,
                updatedAt: workspace.updatedAt,
                createdByUserId: workspace.createdByUserId,
            })
            .from(workspace)
            .where(eq(workspace.workspaceId, workspaceId))
            .limit(1);

        return result.length > 0
            ? [result[0].accountId, result[0].id, result[0]]
            : null;
    }

    // ===========================
    // Delete
    // ===========================

    async deleteByAccountId(accountId: AccountPk, tx?: TransactionCtx): Promise<void> {
        const ctx = this.getDbContext(tx);
        await ctx.delete(workspace).where(eq(workspace.accountId, accountId));
    }

    async deleteByWorkspaceId(id: WorkspacePk, tx?: TransactionCtx): Promise<void> {
        const ctx = this.getDbContext(tx);
        await ctx.delete(workspace).where(eq(workspace.id, id));
    }

    // ===========================
    // Exists
    // ===========================

    async existsByAccountId(accountId: AccountPk): Promise<boolean> {
        const result = await this.db
            .select({ id: workspace.id })
            .from(workspace)
            .where(eq(workspace.accountId, accountId))
            .limit(1);

        return result.length > 0;
    }
}

export const workspaceDAL = new WorkspaceDAL(db);
