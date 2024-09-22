import { env } from "@/utils/env";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/models/index.ts",
    out: "./src/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DB_URL,
    },
    verbose: true,
    strict: true,
});
