import { and, eq, sql } from "drizzle-orm";

import { log } from "@/lib/logger";

import { type DB, db } from "..";
import { account, user } from "../models";
import { Account } from "../models/account";
import { type NewUser, type User } from "../models/user";

class UserDAL {
    constructor(private db: DB) {
        this.db = db;
    }

    async create(payload: NewUser): Promise<User> {
        try {
            const result = await this.db.insert(user).values(payload).returning();
            return result[0];
        } catch (e) {
            log.error(`Failed to create user: ${e}`);
            throw Error("Failed to create user", { cause: e });
        }
    }

    async update(
        accountId: number,
        userId: number,
        newData: Partial<
            Pick<User, "isBlocked" | "username" | "passwordHash" | "passwordAge">
        >,
    ): Promise<void> {
        await this.db
            .update(user)
            .set(newData)
            .where(and(eq(user.accountId, accountId), eq(user.id, userId)));
    }

    async existsByUsername(
        username: string,
        accountId: string,
    ): Promise<null | { accountId: Account["id"]; userId: User["id"] }> {
        const result = await this.db
            .select({ userId: user.id, accuntId: account.id })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.accountId))
            .where(and(eq(user.username, username), eq(account.accountId, accountId)))
            .limit(1);

        return result.length > 0
            ? {
                  accountId: result[0].accuntId,
                  userId: result[0].userId,
              }
            : null;
    }

    async existsByUserId(
        userId: string,
        accountId: string,
    ): Promise<null | { accountId: Account["id"]; userId: User["id"] }> {
        const result = await this.db
            .select({ userId: user.id, accuntId: account.id })
            .from(user)
            .innerJoin(account, eq(user.accountId, account.accountId))
            .where(and(eq(user.userId, userId), eq(account.accountId, accountId)))
            .limit(1);

        return result.length > 0
            ? {
                  accountId: result[0].accuntId,
                  userId: result[0].userId,
              }
            : null;
    }

    async delete(userId: string, accountId: number): Promise<void> {
        await this.db
            .delete(user)
            .where(and(eq(user.userId, userId), eq(user.accountId, accountId)));
    }

    async getMany(
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
}

export const userDAL = new UserDAL(db);
