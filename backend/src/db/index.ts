import { env } from "@/utils/env";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/models";
import { log } from "@/lib/logger";

export const connection = postgres(env.DB_URL, {
    // We want operations to happen in correct order when migrating/seeding and
    // therefore we keep pool size to 1
    max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,

    // To hide warnings/notices while populating DB
    onnotice: env.DB_SEEDING ? () => {} : undefined,
});

export const db = drizzle(connection, { schema, logger: true });
export type DB = typeof db;
export type TransactionCtx = Parameters<Parameters<typeof db.transaction>[0]>[0];

db.execute(sql`SET timezone = UTC`)
    .then(() => {
        log.info("PostgreSQL timezone set to UTC");
    })
    .catch(() => {
        log.fatal("Failed to set timezone to UTC in PostgreSQL");
        process.exit(1);
    });
