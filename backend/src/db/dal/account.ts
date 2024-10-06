import { and, eq, lte } from "drizzle-orm";

import { log } from "@/lib/logger";

import { type DB, db } from "..";
import { account } from "../models";
import { Account, AccountClient, type NewAccount } from "../models/account";

class AccountDAL {
    constructor(private db: DB) {
        this.db = db;
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

    async findByAcctivationToken(tokenHash: string): Promise<number | null> {
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

    async activate(id: number): Promise<void> {
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

    /** Check if a account with email and account name exists or not. */
    async exists(email: string, accountName: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(and(eq(account.email, email), eq(account.accountName, accountName)))
            .limit(1);

        return result.length > 0;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(eq(account.email, email))
            .limit(1);

        return result.length > 0;
    }

    async existsByAccountName(accountName: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(eq(account.accountName, accountName))
            .limit(1);

        return result.length > 0;
    }

    async getHashInfo(
        email: string,
    ): Promise<Pick<Account, "accountId" | "passwordHash"> | null> {
        const result = await this.db
            .select({
                passwordHash: account.passwordHash,
                accountId: account.accountId,
            })
            .from(account)
            .where(eq(account.email, email))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async getByEmail(email: string): Promise<AccountClient | null> {
        const result = await this.db
            .select({
                id: account.id,
                accountId: account.accountId,
                email: account.email,
                accountName: account.accountName,
                status: account.status,
                passwordAge: account.passwordAge,
                isVerified: account.isVerified,
                lastVerifiedAt: account.lastVerifiedAt,
                lastLoggedInAt: account.lastLoggedInAt,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
            })
            .from(account)
            .where(eq(account.email, email))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async setResetToken(
        email: string,
        tokenHash: string,
        duration: Date,
    ): Promise<void> {
        await this.db
            .update(account)
            .set({
                forgotPasswordToken: tokenHash,
                forgotPasswordTokenAge: duration.toUTCString(),
            })
            .where(eq(account.email, email));
    }
}

export const accountDAL = new AccountDAL(db);
