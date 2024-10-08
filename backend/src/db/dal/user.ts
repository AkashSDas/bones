import { and, eq } from "drizzle-orm";

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
}

export const userDAL = new UserDAL(db);
