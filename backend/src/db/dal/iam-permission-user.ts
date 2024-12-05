import { and, eq, inArray } from "drizzle-orm";

import { BadRequestError } from "@/utils/http";

import { dal } from ".";
import { type DB, db } from "..";
import { AccountPk } from "../models/account";
import { type IAMPermissionPk } from "../models/iam-permission";
import {
    IAMPermissionAccessType,
    iamPermissionUser,
} from "../models/iam-permission-user";
import { type UserId, type UserPk, user } from "../models/user";
import { BaseDAL } from "./base";

class IAMPermissionUserDAL extends BaseDAL {
    constructor(db: DB) {
        super(db);
    }

    // ==================================
    // Create
    // ==================================

    async createInBatch(
        permissionId: IAMPermissionPk,
        users: UserId[],
        accessType: IAMPermissionAccessType,
        accountPk: AccountPk,
    ) {
        const permissionMappings = await this.findByPermissionId(permissionId);
        const insertUsers: Set<UserId> = new Set();

        for (const id of users) {
            const mappingExists = permissionMappings.find(
                (m) => m.userId === id && m.accessType === accessType,
            );

            if (!mappingExists) {
                insertUsers.add(id);
            }
        }

        if (insertUsers.size === 0) return;

        const foundUsers = await dal.user.existsByUserIdInBatch(
            Array.from(insertUsers),
            accountPk,
        );

        const foundUsersSet = new Set(foundUsers.map((u) => u.userId));
        if (foundUsersSet.size !== insertUsers.size) {
            throw new BadRequestError({ message: "Some users do not exist" });
        }
        if (Array.from(insertUsers).filter((x) => !foundUsersSet.has(x)).length > 0) {
            throw new BadRequestError({ message: "Some users do not exist" });
        }

        const update = Array.from(insertUsers)
            .map((userId) => {
                const uid = foundUsers.find((u) => u.userId === userId)?.id;

                if (uid === undefined) {
                    return null;
                }

                return {
                    permissionId,
                    userId: uid,
                    accessType,
                };
            })
            .filter((u) => u !== null);

        if (update.length === 0) {
            return;
        }

        await this.db.insert(iamPermissionUser).values(update);
    }

    // ==================================
    // Delete
    // ==================================

    async deleteInBatch(permissionId: IAMPermissionPk, users: UserId[]) {
        const subQuery = this.db
            .select({
                id: user.id,
            })
            .from(user)
            .where(inArray(user.userId, users));

        await this.db
            .delete(iamPermissionUser)
            .where(
                and(
                    eq(iamPermissionUser.permissionId, permissionId),
                    inArray(iamPermissionUser.userId, subQuery),
                ),
            );
    }

    // ==================================
    // Find
    // ==================================

    async findByPermissionId(permissionId: IAMPermissionPk) {
        const result = await this.db
            .select({
                id: iamPermissionUser.id,
                accessType: iamPermissionUser.accessType,
                userPk: iamPermissionUser.userId,
                permissionId: iamPermissionUser.permissionId,
                userId: user.userId,
            })
            .from(iamPermissionUser)
            .innerJoin(user, eq(user.id, iamPermissionUser.userId))
            .where(eq(iamPermissionUser.permissionId, permissionId));

        return result;
    }

    async findByPermissionIdAndUserId(permissionId: IAMPermissionPk, userId: UserPk) {
        const result = await this.db
            .select({
                id: iamPermissionUser.id,
                accessType: iamPermissionUser.accessType,
            })
            .from(iamPermissionUser)
            .where(
                and(
                    eq(iamPermissionUser.permissionId, permissionId),
                    eq(iamPermissionUser.userId, userId),
                ),
            );

        return result;
    }
}

export const iamPermissionUserDAL = new IAMPermissionUserDAL(db);
