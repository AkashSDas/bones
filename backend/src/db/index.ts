import { env } from "@/utils/env";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const connection = postgres(env.DB_URL, {
    // We want operations to happen in correct order when migrating/seeding and
    // therefore we keep pool size to 1
    max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,

    // To hide warnings/notices while populating DB
    onnotice: env.DB_SEEDING ? () => {} : undefined,
});

export const db = drizzle(connection, { logger: true });
export type DB = typeof db;
