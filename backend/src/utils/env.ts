import { config } from "@dotenvx/dotenvx";

import { z } from "zod";

function validatePort(v: string): number {
    // NOTE: If you pass "8a0b", the port will be 8 number
    const port = parseInt(v, 10);

    if (isNaN(port)) {
        throw Error(`Invalid port number, received '${v}'`);
    } else {
        return port;
    }
}

const stringBoolean = z.coerce
    .string()
    .transform((v) => v === "true")
    .default("false");

const EnvironmentVariablesSchema = z
    .object({
        PORT: z.string().transform(validatePort),
        DB_USERNAME: z.string(),
        DB_PASSWORD: z.string(),
        DB_HOST: z.string(),
        DB_PORT: z.string().transform(validatePort),
        DB_NAME: z.string(),
        DB_MIGRATING: stringBoolean,
        DB_SEEDING: stringBoolean,
    })
    .transform((env) => ({
        PORT: env.PORT,
        DB_URL: `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
        DB_MIGRATING: env.DB_MIGRATING,
        DB_SEEDING: env.DB_SEEDING,
    }));

export async function loadEnv(): Promise<
    z.infer<typeof EnvironmentVariablesSchema>
> {
    try {
        const { parsed, error } = config();

        if (parsed) {
            return await EnvironmentVariablesSchema.parseAsync({
                PORT: parsed.PORT,
                DB_USERNAME: parsed.DB_USERNAME,
                DB_PASSWORD: parsed.DB_PASSWORD,
                DB_HOST: parsed.DB_HOST,
                DB_PORT: parsed.DB_PORT,
                DB_NAME: parsed.DB_NAME,
                DB_MIGRATING: parsed.DB_MIGRATING,
                DB_SEEDING: parsed.DB_SEEDING,
            });
        } else {
            throw Error(`Failed to parse environment variables: ${error}`);
        }
    } catch (e) {
        console.error(`Failed to load environment variables: ${e}`);
        process.exit(1);
    }
}

/** Environment variables (validated) */
export const env = await loadEnv();
