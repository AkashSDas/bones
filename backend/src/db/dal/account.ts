import { and, eq, gte, lte, or } from "drizzle-orm";

import { type DB, db } from "..";
import { account } from "../models";
import { type Account, type AccountClient, type NewAccount } from "../models/account";

class AccountDAL {
    constructor(private db: DB) {
        this.db = db;
    }

    // ===========================
    // Insert
    // ===========================

    /** Create a new account. */
    async create(payload: NewAccount): Promise<Account> {
        const result = await this.db.insert(account).values(payload).returning();
        return result[0];
    }

    // ===========================
    // Find
    // ===========================

    /**
     * @param hash Activation token
     * @param age Activation token age limit
     */
    async findByActivationToken(hash: string, age: Date): Promise<number | null> {
        const result = await this.db
            .select({ id: account.id, age: account.changeStatusTokenAge })
            .from(account)
            .where(
                and(
                    eq(account.changeStatusToken, hash),
                    gte(account.changeStatusTokenAge, age.toISOString()),
                ),
            )
            .limit(1);

        return result.length > 0 ? result[0].id : null;
    }

    /**
     * @param hash Reset password token
     * @param age Reset password token age limit
     */
    async findByResetPasswordToken(hash: string, age: Date): Promise<number | null> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(
                and(
                    eq(account.forgotPasswordToken, hash),
                    gte(account.forgotPasswordTokenAge, age.toISOString()),
                ),
            )
            .limit(1);

        return result.length > 0 ? result[0].id : null;
    }

    async findHashDetails(
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

    async findByEmail(email: string): Promise<AccountClient | null> {
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

    async findById(accountId: string): Promise<AccountClient | null> {
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
            .where(eq(account.accountId, accountId))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    /**
     * @param accountId Account id (uuid)
     */
    async findAccountById(accountId: string): Promise<number | null> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(eq(account.accountId, accountId))
            .limit(1);

        return result.length > 0 ? result[0].id : null;
    }

    // ===========================
    // Update
    // ===========================

    /**
     * @param id Primary key of an account
     */
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

    async setResetToken(email: string, token: string, duration: Date): Promise<void> {
        await this.db
            .update(account)
            .set({
                forgotPasswordToken: token,
                forgotPasswordTokenAge: duration.toISOString(),
            })
            .where(eq(account.email, email));
    }

    /**
     * @param id Primary key of an account
     */
    async setPassword(id: number, pwd: string): Promise<void> {
        await this.db
            .update(account)
            .set({
                passwordHash: pwd,
                passwordAge: new Date().toISOString(),
                forgotPasswordToken: null,
                forgotPasswordTokenAge: null,
            })
            .where(eq(account.id, id));
    }

    async setLastLogin(accountId: string): Promise<void> {
        await this.db
            .update(account)
            .set({ lastLoggedInAt: new Date().toISOString() })
            .where(eq(account.accountId, accountId));
    }

    // ===========================
    // Exists
    // ===========================

    /** Check if a account with email and account name exists or not. */
    async exists(email: string, accountName: string): Promise<boolean> {
        const result = await this.db
            .select({ id: account.id })
            .from(account)
            .where(or(eq(account.email, email), eq(account.accountName, accountName)))
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
}

export const accountDAL = new AccountDAL(db);
