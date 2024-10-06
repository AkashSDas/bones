import { and, eq, lte } from "drizzle-orm";

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

    async findAccountByAcctivationToken(tokenHash: string): Promise<number | null> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(
                and(
                    eq(account.changeStatusToken, tokenHash),
                    lte(
                        account.changeStatusTokenAge,
                        new Date(Date.now() + 10 * 60 * 1000).toUTCString(), // 10 minutes
                    ),
                ),
            )
            .limit(1);

        return result.length > 0 ? result[0].id : null;
    }

    async activateAccount(id: number): Promise<void> {
        const result = await this.db
            .update(account)
            .set({
                isVerified: true,
                status: "active",
                changeStatusToken: null,
                changeStatusTokenAge: null,
            })
            .where(eq(account.id, id))
            .returning({ updatedId: account.id });

        if (result.length === 0 || result[0].updatedId !== id) {
            throw new Error("DB query to activate account failed");
        }
    }

    async accountExistsByEmail(email: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(eq(account.email, email))
            .limit(1);

        return result.length > 0;
    }

    async accountExistsByAccountName(accountName: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(eq(account.accountName, accountName))
            .limit(1);

        return result.length > 0;
    }
}

export const accountDAL = new AccountDAL(db);
