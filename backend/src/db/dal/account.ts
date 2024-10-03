import { and, eq } from "drizzle-orm";

import { log } from "@/lib/logger";

import { type DB, db } from "..";
import { account } from "../models";
import { Account, type NewAccount } from "../models/account";

class AccountDAL {
    constructor(private db: DB) {
        this.db = db;
    }

    /** Check if a account with email and account name exists or not. */
    async checkAccountExists(email: string, accountName: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(and(eq(account.email, email), eq(account.accountName, accountName)))
            .limit(1);

        return result.length > 0;
    }

    /** Create a new account. */
    async create(payload: NewAccount): Promise<Account> {
        try {
            const result = await this.db.insert(account).values(payload).returning();
            return result[0];
        } catch (e) {
            log.error(`Failed to create account: ${e}`);
            throw Error("Failed to create account", { cause: e });
        }
    }
}

export const accountDAL = new AccountDAL(db);
