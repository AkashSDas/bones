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
        LOG_LEVEL: z
            .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
            .default("debug"),

        CORS_ORIGINS: z.string().transform((v): string[] => {
            try {
                const origins = v.split(",");

                if (!Array.isArray(origins)) {
                    throw Error("CORS_ORIGINS must be an array");
                } else if (origins.length === 0) {
                    throw Error("CORS_ORIGINS must not be empty");
                } else {
                    return origins;
                }
            } catch (e) {
                throw Error(`Failed to parse CORS_ORIGINS: ${e}. Received value: ${v}`);
            }
        }),

        DB_USERNAME: z.string(),
        DB_PASSWORD: z.string(),
        DB_HOST: z.string(),
        DB_PORT: z.string().transform(validatePort),
        DB_NAME: z.string(),
        DB_MIGRATING: stringBoolean,
        DB_SEEDING: stringBoolean,

        SMTP_HOST: z.string(),
        SMTP_PORT: z.string().transform(validatePort),
        SMTP_USERNAME: z.string(),
        SMTP_PASSWORD: z.string(),
        FROM_EMAIL: z.string().email(),
    })
    .transform((env) => ({
        PORT: env.PORT,
        DB_URL: `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
        DB_MIGRATING: env.DB_MIGRATING,
        DB_SEEDING: env.DB_SEEDING,
        LOG_LEVEL: env.LOG_LEVEL,
        CORS_ORIGINS: env.CORS_ORIGINS,
        SMTP_HOST: env.SMTP_HOST,
        SMTP_PORT: env.SMTP_PORT,
        SMTP_USERNAME: env.SMTP_USERNAME,
        SMTP_PASSWORD: env.DB_PASSWORD,
        FROM_EMAIL: env.FROM_EMAIL,
    }));

export function loadEnv(): z.infer<typeof EnvironmentVariablesSchema> {
    try {
        const { parsed, error } = config();

        if (parsed) {
            return EnvironmentVariablesSchema.parse(parsed);
        } else {
            throw Error(`Failed to parse environment variables: ${error}`);
        }
    } catch (e) {
        // Cannot use `log.error` since it has not been initialized first
        console.error(`Failed to load environment variables: ${e}`);
        process.exit(1);
    }
}

/** Environment variables (validated) */
export const env = loadEnv();
