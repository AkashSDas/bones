import type { DB, TransactionCtx } from "..";

export class BaseDAL {
    constructor(protected readonly db: DB) {}

    // ===========================
    // Utility methods
    // ===========================

    protected getDbContext(tx?: TransactionCtx): DB | TransactionCtx {
        let ctx: DB | TransactionCtx = this.db;

        if (tx !== undefined) {
            ctx = tx;
        }

        return ctx;
    }
}
