import type { DB, TransactionCtx } from "..";

export class BaseDAL {
    constructor(readonly db: DB) {}

    // ===========================
    // Utility methods
    // ===========================

    getDbContext(tx?: TransactionCtx): DB | TransactionCtx {
        let ctx: DB | TransactionCtx = this.db;

        if (tx !== undefined) {
            ctx = tx;
        }

        return ctx;
    }
}
