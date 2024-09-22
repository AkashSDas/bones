import { env } from "@/utils/env";

import { type Table, getTableName, sql } from "drizzle-orm";

import { type DB, connection, db } from ".";

if (!env.DB_SEEDING) {
    throw new Error(
        "Environment variable for DB_SEEDING is not set. Values can be 'true' or 'false'",
    );
}

async function resetTable(db: DB, table: Table) {
    return db.execute(
        sql.raw(
            `TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`,
        ),
    );
}

for (const table of []) {
    // await db.delete(table); // clear tables without truncating / resetting ids
    await resetTable(db, table);
}

// TODO: seed here
// await user(db); // example

await connection.end();
