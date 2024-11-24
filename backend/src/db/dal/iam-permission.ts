import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { type IAMPolicy } from "@/schemas/iam-permission";

import { type DB, type TransactionCtx, db } from "..";
import { iamPermission } from "../models";
import { type AccountPk } from "../models/account";
import {
    type IAMPermissionClient,
    type IAMPermissionPk,
    IAMPermissionSchema,
    type IAMService,
} from "../models/iam-permission";
import { BaseDAL } from "./base";

class IAMPermissionDAL extends BaseDAL {
    constructor(db: DB) {
        super(db);
    }

    // ==================================
    // Exists
    // ==================================

    /** Check whether an account has a service wide policy for a given service type. */
    async existsServiceWidePolicy(accountId: AccountPk, serviceType: IAMService) {
        const result = await this.db
            .select({ id: iamPermission.id })
            .from(iamPermission)
            .where(
                and(
                    eq(iamPermission.accountId, accountId),
                    eq(iamPermission.serviceType, serviceType),
                ),
            )
            .limit(1);

        return result.length > 0;
    }

    // ==================================
    // Create
    // ==================================

    async createServiceWidePolicy(
        accountId: AccountPk,
        serviceType: IAMService,
        policy: IAMPolicy,
        policyName: string,
        tx?: TransactionCtx,
    ) {
        const ctx = this.getDbContext(tx);

        const result = await ctx
            .insert(iamPermission)
            .values({
                accountId,
                serviceType,
                policy,
                name: policyName,
            })
            .returning();

        return result[0];
    }

    // ==================================
    // Find
    // ==================================

    async findIAMWidePermission(
        accountId: AccountPk,
    ): Promise<null | [AccountPk, IAMPermissionPk, IAMPermissionClient]> {
        const result = await this.db
            .select({
                id: iamPermission.id,
                name: iamPermission.name,
                permissionId: iamPermission.permissionId,
                policy: iamPermission.policy,
                accountId: iamPermission.accountId,
                createdAt: iamPermission.createdAt,
                updatedAt: iamPermission.updatedAt,
            })
            .from(iamPermission)
            .where(eq(iamPermission.accountId, accountId))
            .limit(1);

        return result.length > 0
            ? [
                  result[0].accountId,
                  result[0].id,
                  {
                      name: result[0].name,
                      permissionId: result[0].permissionId,
                      policy: result[0].policy as z.infer<
                          typeof IAMPermissionSchema.shape.policy
                      >,
                      createdAt: result[0].createdAt,
                      updatedAt: result[0].updatedAt,
                  },
              ]
            : null;
    }

    // async findByWorkspaceId(
    //     workspaceId: number,
    // ): Promise<[number, IAMPermissionClient] | null> {
    //     const result = await this.db
    //         .select({
    //             id: iamPermission.id,
    //             name: iamPermission.name,
    //             permissionId: iamPermission.permissionId,
    //             policy: iamPermission.policy,
    //             accountId: iamPermission.accountId,
    //             createdAt: iamPermission.createdAt,
    //             updatedAt: iamPermission.updatedAt,
    //         })
    //         .from(iamPermission)
    //         .where(eq(iamPermission.workspaceId, workspaceId))
    //         .limit(1);

    //     return result.length > 0
    //         ? [
    //               result[0].id,
    //               {
    //                   name: result[0].name,
    //                   permissionId: result[0].permissionId,
    //                   policy: result[0].policy as z.infer<
    //                       typeof IAMPermissionSchema.shape.policy
    //                   >,
    //                   createdAt: result[0].createdAt,
    //                   updatedAt: result[0].updatedAt,
    //                   accountId: result[0].accountId,
    //               },
    //           ]
    //         : null;
    // }

    // ===========================
    // Delete
    // ===========================

    // /**
    //  * Supporting transaction
    //  */
    // async deleteByAccountId(accountId: number, tx?: TransactionCtx): Promise<void> {
    //     let ctx: DB | TransactionCtx = this.db;

    //     if (tx !== undefined) {
    //         ctx = tx;
    //     }

    //     await ctx.delete(iamPermission).where(eq(iamPermission.accountId, accountId));
    // }

    // /**
    //  * `resourceId` will be public facing uuid ID for a resource. Resource will be things
    //  * like Workspace, etc...
    //  *
    //  * Supporting transaction
    //  */
    // async deleteByResourceId(resourceId: string, tx?: TransactionCtx): Promise<void> {
    //     let ctx: DB | TransactionCtx = this.db;

    //     if (tx !== undefined) {
    //         ctx = tx;
    //     }

    //     await ctx.delete(iamPermission).where(eq(iamPermission.resourceId, resourceId));
    // }
}

export const iamPermissionDAL = new IAMPermissionDAL(db);
