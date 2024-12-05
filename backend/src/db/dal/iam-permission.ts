import { and, asc, eq, inArray, sql } from "drizzle-orm";
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
import {
    IAMPermissionAccessType,
    iamPermissionUser,
} from "../models/iam-permission-user";
import { type UserClient, UserPk, user } from "../models/user";
import { WorkspacePk } from "../models/workspace";
import { BaseDAL } from "./base";

class IAMPermissionDAL extends BaseDAL {
    constructor(db: DB) {
        super(db);
    }

    // ==================================
    // Create
    // ==================================

    async deleteWorkspaceServiceWide(accountPk: AccountPk): Promise<void> {
        const perm = await this.findWorkspaceServiceWidePermission(accountPk);
        if (perm) {
            await this.db.delete(iamPermission).where(eq(iamPermission.id, perm[0]));
        }
    }

    async createWorkspaceServiceWide(
        accountPk: AccountPk,
    ): Promise<IAMPermissionClient> {
        try {
            const exists = await this.findWorkspaceServiceWidePermission(accountPk);
            if (exists) {
                log.info(
                    `Workspace service wide permission already exists for account ${accountPk}`,
                );
                return exists[1];
            }
        } catch (e) {
            if (!(e instanceof InternalServerError)) {
                throw e;
            }
        }

        const result = await this.db
            .insert(iamPermission)
            .values({
                name: "Workspace Service Wide Policy",
                serviceType: IAM_SERVICE.WORKSPACE,
                isServiceWide: true,
                readAll: false,
                writeAll: false,
                accountId: accountPk,
            })
            .returning();

        return result[0];
    }

    async createIAMServiceWide(
        accountPk: AccountPk,
        tx?: TransactionCtx,
    ): Promise<IAMPermissionClient> {
        try {
            const exists = await this.findIAMWidePermission(accountPk, tx);
            if (exists) {
                throw new ConflictError({ message: "IAM permission already exists" });
            }
        } catch (e) {
            if (!(e instanceof InternalServerError)) {
                throw e;
            }
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
        if (body.readAll !== undefined) patch.readAll = body.readAll;
        if (body.writeAll !== undefined) patch.writeAll = body.writeAll;

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

    async findWorkspacePermission(
        accountPk: AccountPk,
        userPk: UserPk,
        workspacePk: WorkspacePk,
    ): Promise<[IAMPermissionPk, IAMPermissionClient] | null> {
        const result = await this.db
            .select(this.permissionSelect)
            .from(iamPermission)
            .innerJoin(
                iamPermissionUser,
                eq(iamPermissionUser.permissionId, iamPermission.id),
            )
            .where(
                and(
                    eq(iamPermission.accountId, accountPk),
                    eq(iamPermission.serviceType, IAM_SERVICE.WORKSPACE),
                    eq(iamPermission.isServiceWide, false),
                    eq(iamPermission.workspaceId, workspacePk),
                    eq(iamPermissionUser.userId, userPk),
                ),
            )
            .limit(1);

        return result.length === 0 ? null : [result[0].id, result[0]];
    }

    async findWorkspaceServiceWidePermission(
        accountPk: AccountPk,
    ): Promise<[IAMPermissionPk, IAMPermissionClient]> {
        const result = await this.db
            .select(this.permissionSelect)
            .from(iamPermission)
            .where(
                and(
                    eq(iamPermission.accountId, accountPk),
                    eq(iamPermission.isServiceWide, true),
                    eq(iamPermission.serviceType, IAM_SERVICE.WORKSPACE),
                ),
            )
            .limit(1);

        if (result.length === 0) {
            log.error(
                `Account ${accountPk} does not have a workspace service wide permission`,
            );
            throw new InternalServerError({});
        }

        return [result[0].id, result[0]];
    }

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
                    eq(iamPermission.serviceType, IAM_SERVICE.IAM),
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
    ): Promise<
        | [
              IAMPermissionPk,
              IAMPermissionClient & {
                  users: (UserClient & { accessType: IAMPermissionAccessType })[];
              },
          ]
        | null
    > {
        const permissions = await this.db
            .select(this.permissionSelect)
            .from(iamPermission)
            .where(
                and(
                    eq(iamPermission.permissionId, permissionId),
                    eq(iamPermission.accountId, accountPk),
                ),
            )
            .orderBy(asc(iamPermission.updatedAt))
            .limit(1);

        if (permissions.length === 0) {
            return null;
        }

        const permission = permissions[0];

        const iamPermissionUsers = await this.db
            .select({
                accessType: iamPermissionUser.accessType,
                userId: user.userId,
                username: user.username,
                isBlocked: user.isBlocked,
                lastLoggedInAt: user.lastLoggedInAt,
                passwordAge: user.passwordAge,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })
            .from(user)
            .innerJoin(iamPermissionUser, eq(iamPermissionUser.userId, user.id))
            .where(eq(iamPermissionUser.permissionId, permission.id))
            .groupBy(
                iamPermissionUser.permissionId,
                iamPermissionUser.accessType,
                user.userId,
                user.username,
                user.isBlocked,
                user.lastLoggedInAt,
                user.passwordAge,
                user.createdAt,
                user.updatedAt,
            );

        return [permission.id, { ...permission, users: iamPermissionUsers }];
    }

    async findManyByAccountId(
        accountPk: AccountPk,
        search: string | undefined,
        limit: number = 20,
        offset: number = 0,
    ): Promise<
        [
            number,
            (IAMPermissionClient & {
                users: (UserClient & { accessType: IAMPermissionAccessType })[];
            })[],
        ]
    > {
        if (search === undefined) {
            const totalPermissions = await this.db
                .select({ count: sql<number>`COUNT(DISTINCT ${iamPermission.id})` })
                .from(iamPermission)
                .where(eq(iamPermission.accountId, accountPk))
                .then((r) => r[0].count);

            const permissions = await this.db
                .select(this.permissionSelect)
                .from(iamPermission)
                .orderBy(asc(iamPermission.updatedAt))
                .limit(limit)
                .offset(offset);

            const iamPermissionUsers = await this.db
                .select({
                    permissionId: iamPermissionUser.permissionId,
                    accessType: iamPermissionUser.accessType,
                    userId: user.userId,
                    username: user.username,
                    isBlocked: user.isBlocked,
                    lastLoggedInAt: user.lastLoggedInAt,
                    passwordAge: user.passwordAge,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                })
                .from(user)
                .innerJoin(iamPermissionUser, eq(iamPermissionUser.userId, user.id))
                .where(
                    inArray(
                        iamPermissionUser.permissionId,
                        permissions.map((p) => p.id),
                    ),
                )
                .groupBy(
                    iamPermissionUser.permissionId,
                    iamPermissionUser.accessType,
                    user.userId,
                    user.username,
                    user.isBlocked,
                    user.lastLoggedInAt,
                    user.passwordAge,
                    user.createdAt,
                    user.updatedAt,
                );

            const results: (IAMPermissionClient & {
                users: (UserClient & { accessType: IAMPermissionAccessType })[];
            })[] = [];

            for (const perm of permissions) {
                const users = iamPermissionUsers
                    .filter((u) => u.permissionId === perm.id)
                    .map((u) => ({
                        accessType: u.accessType,
                        userId: u.userId,
                        username: u.username,
                        isBlocked: u.isBlocked,
                        lastLoggedInAt: u.lastLoggedInAt,
                        passwordAge: u.passwordAge,
                        createdAt: u.createdAt,
                        updatedAt: u.updatedAt,
                    }));

                results.push({ ...perm, users });
            }

            return [totalPermissions, results];
        } else {
            const totalPermissions = await this.db
                .select({ count: sql<number>`COUNT(DISTINCT ${iamPermission.id})` })
                .from(iamPermission)
                .where(
                    and(
                        eq(iamPermission.accountId, accountPk),
                        sql`to_tsvector('english', ${iamPermission.name}) @@ to_tsquery('english', ${search})`,
                    ),
                )
                .then((r) => r[0].count);

            const permissions = await this.db
                .select(this.permissionSelect)
                .from(iamPermission)
                .where(
                    and(
                        eq(iamPermission.accountId, accountPk),
                        sql`to_tsvector('english', ${iamPermission.name}) @@ to_tsquery('english', ${search})`,
                    ),
                )
                .orderBy(asc(iamPermission.updatedAt))
                .limit(limit)
                .offset(offset);

            const iamPermissionUsers = await this.db
                .select({
                    permissionId: iamPermissionUser.permissionId,
                    accessType: iamPermissionUser.accessType,
                    userId: user.userId,
                    username: user.username,
                    isBlocked: user.isBlocked,
                    lastLoggedInAt: user.lastLoggedInAt,
                    passwordAge: user.passwordAge,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                })
                .from(user)
                .innerJoin(iamPermissionUser, eq(iamPermissionUser.userId, user.id))
                .where(
                    inArray(
                        iamPermissionUser.permissionId,
                        permissions.map((p) => p.id),
                    ),
                )
                .groupBy(
                    iamPermissionUser.permissionId,
                    iamPermissionUser.accessType,
                    user.userId,
                    user.username,
                    user.isBlocked,
                    user.lastLoggedInAt,
                    user.passwordAge,
                    user.createdAt,
                    user.updatedAt,
                );

            const results: (IAMPermissionClient & {
                users: (UserClient & { accessType: IAMPermissionAccessType })[];
            })[] = [];

            for (const perm of permissions) {
                const users = iamPermissionUsers
                    .filter((u) => u.permissionId === perm.id)
                    .map((u) => ({
                        accessType: u.accessType,
                        userId: u.userId,
                        username: u.username,
                        isBlocked: u.isBlocked,
                        lastLoggedInAt: u.lastLoggedInAt,
                        passwordAge: u.passwordAge,
                        createdAt: u.createdAt,
                        updatedAt: u.updatedAt,
                    }));

                results.push({ ...perm, users });
            }

            return [totalPermissions, results];
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
