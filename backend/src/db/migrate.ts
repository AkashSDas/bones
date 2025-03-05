import { env } from "@/utils/env";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { connection, db } from "@/db";

import config from "../../drizzle.config";

if (!env.DB_MIGRATING) {
    throw new Error(
        "Environment variable for DB_MIGRATING is not set. Values can be 'true' or 'false'",
    );
}

(async () => {
    try {
        await migrate(db, { migrationsFolder: config.out! });
    } catch (e) {
        console.log("Failed to migrate");
        console.log(e);
    } finally {
        await connection.end();
    }
})();
