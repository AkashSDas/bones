import { and, asc, eq, sql } from "drizzle-orm";

import { type DB, db } from "..";
import { account, user } from "../models";
import { type Account } from "../models/account";
import { type NewUser, type User, type UserClient } from "../models/user";

class UserDAL {
    constructor(private db: DB) {
        this.db = db;
    }

    // ===========================
    // Insert
    // ===========================

    async create(payload: NewUser): Promise<User> {
        const result = await this.db.insert(user).values(payload).returning();
        return result[0];
    }

    // ===========================
    // Update
    // ===========================

    /**
     * @param id Primary key of an user
     * @param accountId Primary key of an account
     */
    async setUserInfo(
        id: number,
        accountId: number,
        newData: Partial<
            Pick<User, "isBlocked" | "username" | "passwordHash" | "passwordAge">
        >,
    ): Promise<void> {
        await this.db
            .update(user)
            .set(newData)
            .where(and(eq(user.accountId, accountId), eq(user.id, id)));
    }

    async setLastLogin(userId: string, accountId: string): Promise<void> {
        const result = await this.db
            .select({ accountId: account.id })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.id))
            .where(and(eq(user.userId, userId), eq(account.accountId, accountId)))
            .limit(1);

        const accountRecord = result.length > 0 ? result[0] : null;

        if (accountRecord === null) {
            throw new Error("Account doesn't exists");
        }

        await this.db
            .update(user)
            .set({ lastLoggedInAt: new Date().toISOString() })
            .where(eq(user.accountId, accountRecord.accountId));
    }

    // ===========================
    // Exists
    // ===========================

    /**
     * @param accountId Account id (uuid)
     */
    async existsByUsername(
        username: string,
        accountId: string,
    ): Promise<null | { accountId: Account["id"]; userId: User["id"] }> {
        const result = await this.db
            .select({ userId: user.id, accountId: account.id })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.id))
            .where(and(eq(user.username, username), eq(account.accountId, accountId)))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    /**
     * @param userId User id (uuid)
     * @param accountId Account id (uuid)
     */
    async existsByUserId(
        userId: string,
        accountId: string,
    ): Promise<null | { accountId: Account["id"]; userId: User["id"] }> {
        const result = await this.db
            .select({ userId: user.id, accountId: account.id })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.id))
            .where(and(eq(user.userId, userId), eq(account.accountId, accountId)))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    // ===========================
    // Delete
    // ===========================

    /**
     * @param userId User id (uuid)
     * @param accountId Primary key of an account
     */
    async delete(userId: string, accountId: number): Promise<void> {
        await this.db
            .delete(user)
            .where(and(eq(user.userId, userId), eq(user.accountId, accountId)));
    }

    // ===========================
    // Find
    // ===========================

    /**
     * @param accountId Primary key of an account
     * @param search Username text search
     */
    async find(
        accountId: number,
        search: string | undefined = undefined,
        limit: number = 20,
        offset: number = 0,
    ): Promise<{ users: User[]; totalCount: number }> {
        let totalCountQuery;
        let usersQuery;

        if (search !== undefined) {
            const searchCondition = sql`to_tsvector('english', ${user.username}) @@ to_tsquery('english', ${search})`;

            totalCountQuery = this.db
                .select({ count: sql<number>`COUNT(*)` })
                .from(user)
                .where(and(eq(user.accountId, accountId), searchCondition));

            usersQuery = this.db
                .select()
                .from(user)
                .where(and(eq(user.accountId, accountId), searchCondition))
                .orderBy(asc(user.username))
                .limit(limit)
                .offset(offset);
        } else {
            totalCountQuery = this.db
                .select({ count: sql<number>`COUNT(*)` })
                .from(user)
                .where(eq(user.accountId, accountId));

            usersQuery = this.db
                .select()
                .from(user)
                .where(eq(user.accountId, accountId))
                .orderBy(asc(user.username))
                .limit(limit)
                .offset(offset);
        }

        const [totalCountResult, usersResult] = await Promise.all([
            totalCountQuery,
            usersQuery,
        ]);

        return {
            users: usersResult,
            totalCount: totalCountResult[0].count,
        };
    }

    async findHashDetails(
        accountId: string,
        username: string,
    ): Promise<
        (Pick<User, "passwordHash" | "userId"> & Pick<Account, "accountId">) | null
    > {
        console.log(
            await this.db
                .select({
                    accountId: account.accountId,
                    passwordHash: user.passwordHash,
                    userId: user.userId,
                    username: user.username,
                    id: account.id,
                })
                .from(user)
                .innerJoin(account, eq(user.accountId, account.id))
                // .where(and(eq(user.username, username), eq(account.accountId, accountId)))
                .limit(1),
        );

        const result = await this.db
            .select({
                accountId: account.accountId,
                passwordHash: user.passwordHash,
                userId: user.userId,
            })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.id))
            .where(and(eq(user.username, username), eq(account.accountId, accountId)))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    /**
     * @param userId User id (uuid)
     * @param accountId Account id (uuid)
     */
    async findById(
        userId: string,
        accountId: string,
    ): Promise<null | [number, UserClient]> {
        const result = await this.db
            .select({
                id: user.id,
                userId: user.userId,
                username: user.username,
                isBlocked: user.isBlocked,
                passwordAge: user.passwordAge,
                lastLoggedInAt: user.lastLoggedInAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.id))
            .where(and(eq(user.userId, userId), eq(account.accountId, accountId)))
            .limit(1);

        return result.length > 0 ? [result[0].id, result[0]] : null;
    }
}

export const userDAL = new UserDAL(db);
