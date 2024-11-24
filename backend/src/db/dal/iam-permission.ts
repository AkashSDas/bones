import { and, asc, eq, or, sql } from "drizzle-orm";
import { z } from "zod";

import { IAMPermissionSchemas } from "@/api/iam-permission/iam-permission.schema";
import { log } from "@/lib/logger";
import { ConflictError, InternalServerError } from "@/utils/http";

import { type DB, type TransactionCtx, db } from "..";
import { iamPermission } from "../models";
import { type AccountPk } from "../models/account";
import {
    type IAMPermissionClient,
    type IAMPermissionId,
    type IAMPermissionPk,
    IAM_SERVICE,
    NewIAMPermission,
} from "../models/iam-permission";
import { iamPermissionUser } from "../models/iam-permission-user";
import { type UserClient, UserClientSchema, type UserId, user } from "../models/user";
import { BaseDAL } from "./base";

class IAMPermissionDAL extends BaseDAL {
    constructor(db: DB) {
        super(db);
    }

    // ==================================
    // Create
    // ==================================

    async createIAMServiceWide(
        accountPk: AccountPk,
        tx?: TransactionCtx,
    ): Promise<IAMPermissionClient> {
        const exists = await this.findIAMWidePermission(accountPk, tx);
        if (exists) {
            throw new ConflictError({ message: "IAM permission already exists" });
        }

        const ctx = this.getDbContext(tx);
        const result = await ctx
            .insert(iamPermission)
            .values({
                name: "IAM Service Wide Policy",
                serviceType: IAM_SERVICE.IAM,
                isServiceWide: false,
                readAll: false,
                writeAll: false,
                accountId: accountPk,
            })
            .returning();

        return result[0];
    }

    // ==================================
    // Update
    // ==================================

    async update(
        accountPk: AccountPk,
        permissionId: IAMPermissionId,
        body: z.infer<typeof IAMPermissionSchemas.UpdateIAMPermissionRequestBody>,
        tx?: TransactionCtx,
    ): Promise<IAMPermissionClient> {
        const ctx = this.getDbContext(tx);

        const patch: Partial<NewIAMPermission> = {};
        if (body.name) patch.name = body.name;
        if (body.readAll) patch.readAll = body.readAll;
        if (body.writeAll) patch.writeAll = body.writeAll;

        const result = await ctx
            .update(iamPermission)
            .set(patch)
            .where(
                and(
                    eq(iamPermission.permissionId, permissionId),
                    eq(iamPermission.accountId, accountPk),
                ),
            )
            .returning();

        return result[0];
    }

    // ==================================
    // Find
    // ==================================

    async findIAMWidePermission(
        accountPk: AccountPk,
        tx?: TransactionCtx,
    ): Promise<[IAMPermissionPk, IAMPermissionClient]> {
        const ctx = this.getDbContext(tx);
        const result = await ctx
            .select(this.permissionSelect)
            .from(iamPermission)
            .where(
                and(
                    eq(iamPermission.accountId, accountPk),
                    eq(iamPermission.isServiceWide, true),
                ),
            )
            .limit(1);

        if (result.length === 0) {
            log.error(`Account ${accountPk} does not have a service wide permission`);
            throw new InternalServerError({});
        }

        return [result[0].id, result[0]];
    }

    async findById(
        permissionId: IAMPermissionId,
        accountPk: AccountPk,
    ): Promise<[number, IAMPermissionClient & { users: UserClient[] }] | null> {
        const result = await this.db
            .select({
                ...this.permissionSelect,
                users: sql<UserClient[]>`ARRAY_AGG(${user})`,
            })
            .from(iamPermission)
            .innerJoin(
                iamPermissionUser,
                eq(iamPermissionUser.permissionId, iamPermission.id),
            )
            .innerJoin(user, eq(user.id, iamPermissionUser.userId))
            .where(
                and(
                    eq(iamPermission.permissionId, permissionId),
                    eq(iamPermission.accountId, accountPk),
                ),
            )
            .limit(1);

        return result.length === 0 ? null : [result[0].id, result[0]];
    }

    async findManyByAccountId(
        accountPk: AccountPk,
        search: string | undefined = undefined,
        limit: number = 20,
        offset: number = 0,
    ): Promise<[number, (IAMPermissionClient & { users: UserClient[] })[]]> {
        if (search !== undefined) {
            const iamSearchCondition = sql`to_tsvector('english', ${iamPermission.name}) @@ to_tsquery('english', ${search})`;
            const userSearchCondition = sql`to_tsvector('english', ${user.username}) @@ to_tsquery('english', ${search})`;

            const totalCount = await this.db
                .select({ count: sql<number>`COUNT(${iamPermission.id})` })
                .from(iamPermission)
                .innerJoin(
                    iamPermissionUser,
                    eq(iamPermissionUser.permissionId, iamPermission.id),
                )
                .innerJoin(user, eq(user.id, iamPermissionUser.userId))
                .where(
                    and(
                        or(iamSearchCondition, userSearchCondition),
                        eq(iamPermission.accountId, accountPk),
                    ),
                )
                .then((r) => r[0].count);

            const result = await this.db
                .select({
                    ...this.permissionSelect,
                    users: sql<UserClient[]>`ARRAY_AGG(${user})`,
                })
                .from(iamPermission)
                .innerJoin(
                    iamPermissionUser,
                    eq(iamPermissionUser.permissionId, iamPermission.id),
                )
                .innerJoin(user, eq(user.id, iamPermissionUser.userId))
                .where(
                    and(
                        or(iamSearchCondition, userSearchCondition),
                        eq(iamPermission.accountId, accountPk),
                    ),
                )
                .orderBy(asc(iamPermission.updatedAt))
                .limit(limit)
                .offset(offset);

            return [
                totalCount,
                result.map((r) => ({
                    ...r,
                    users: r.users.map((u) => UserClientSchema.parse(u)),
                })),
            ];
        } else {
            const totalCount = await this.db
                .select({ count: sql<number>`COUNT(${iamPermission.id})` })
                .from(iamPermission)
                .innerJoin(
                    iamPermissionUser,
                    eq(iamPermissionUser.permissionId, iamPermission.id),
                )
                .innerJoin(user, eq(user.id, iamPermissionUser.userId))
                .where(eq(iamPermission.accountId, accountPk))
                .then((r) => r[0].count);

            const result = await this.db
                .select({
                    ...this.permissionSelect,
                    users: sql<UserClient[]>`ARRAY_AGG(${user})`,
                })
                .from(iamPermission)
                .innerJoin(
                    iamPermissionUser,
                    eq(iamPermissionUser.permissionId, iamPermission.id),
                )
                .innerJoin(user, eq(user.id, iamPermissionUser.userId))
                .where(eq(iamPermission.accountId, accountPk))
                .orderBy(asc(iamPermission.updatedAt))
                .limit(limit)
                .offset(offset);

            return [
                totalCount,
                result.map((r) => ({
                    ...r,
                    users: r.users.map((u) => UserClientSchema.parse(u)),
                })),
            ];
        }
    }

    // ==================================
    // Private methods
    // ==================================

    private get permissionSelect() {
        return {
            id: iamPermission.id,
            permissionId: iamPermission.permissionId,
            name: iamPermission.name,
            serviceType: iamPermission.serviceType,
            isServiceWide: iamPermission.isServiceWide,
            readAll: iamPermission.readAll,
            writeAll: iamPermission.writeAll,
            createdAt: iamPermission.createdAt,
            updatedAt: iamPermission.updatedAt,
        };
    }
}

export const iamPermissionDAL = new IAMPermissionDAL(db);
