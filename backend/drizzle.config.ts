import { env } from "@/utils/env";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/models/index.ts", // where all the db models are present
    out: "./src/db/migrations", // where migrations are output
    dialect: "postgresql",
    dbCredentials: {
        url: env.DB_URL,
    },
    verbose: true,
    strict: true,
});
