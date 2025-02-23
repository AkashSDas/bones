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

const booleanString = z.coerce
    .string()
    .transform((v) => v === "true")
    .default("false");

export const EnvironmentVariablesSchema = z
    .object({
        APP_URL: z.string().url(),
        CLIENT_URL: z.string().url(),

        ENV: z.enum(["production", "development", "qa", "pre-production"]),
        PORT: z.string().transform(validatePort),
        LOG_LEVEL: z
            .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
            .default("debug"),

        COOKIE_ENCRYPTION_KEY: z.string(),
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
        DB_MIGRATING: booleanString,
        DB_SEEDING: booleanString,

        REDIS_HOST: z.string(),
        REDIS_PORT: z.string().transform(validatePort),

        SMTP_HOST: z.string(),
        SMTP_PORT: z.string().transform(validatePort),
        SMTP_USERNAME: z.string(),
        SMTP_PASSWORD: z.string(),
        FROM_EMAIL: z.string().email(),

        ACCESS_TOKEN_SECRET: z.string(),
        REFRESH_TOKEN_SECRET: z.string(),
        ACCESS_TOKEN_AGE: z.string(),
        REFRESH_TOKEN_AGE: z.string(),
        REFRESH_TOKEN_AGE_IN_DATE: z.string().transform(function (v) {
            const date = Date.parse(v);

            if (isNaN(date) === true) {
                return new Date(Date.now() + 24 * 60 * 1000);
            } else {
                return new Date(date);
            }
        }),

        WORKSPACE_EXPOSED_PORTS: z.string().transform((v): number[] => {
            try {
                const ports = v.split(",");

                if (!Array.isArray(ports)) {
                    throw Error("WORKSPACE_EXPOSED_PORTS must be an array");
                } else if (ports.length === 0) {
                    throw Error("WORKSPACE_EXPOSED_PORTS must not be empty");
                } else {
                    return ports.map(validatePort);
                }
            } catch (e) {
                throw Error(
                    `Failed to parse WORKSPACE_EXPOSED_PORTS: ${e}. Received value: ${v}`,
                );
            }
        }),
        WORKSPACE_DOMAIN_SUFFIX: z.string(),
    })
    .transform((env) => ({
        APP_URL: env.APP_URL,
        CLIENT_URL: env.CLIENT_URL,

        ENV: env.ENV,
        PORT: env.PORT,
        LOG_LEVEL: env.LOG_LEVEL,

        COOKIE_ENCRYPTION_KEY: env.COOKIE_ENCRYPTION_KEY,
        CORS_ORIGINS: env.CORS_ORIGINS,

        DB_URL: `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
        DB_MIGRATING: env.DB_MIGRATING,
        DB_SEEDING: env.DB_SEEDING,

        REDIS_HOST: env.REDIS_HOST,
        REDIS_PORT: env.REDIS_PORT,

        SMTP_HOST: env.SMTP_HOST,
        SMTP_PORT: env.SMTP_PORT,
        SMTP_USERNAME: env.SMTP_USERNAME,
        SMTP_PASSWORD: env.SMTP_PASSWORD,
        FROM_EMAIL: env.FROM_EMAIL,

        ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET,
        ACCESS_TOKEN_AGE: env.ACCESS_TOKEN_AGE,
        REFRESH_TOKEN_AGE: env.REFRESH_TOKEN_AGE,
        REFRESH_TOKEN_AGE_IN_DATE: env.REFRESH_TOKEN_AGE_IN_DATE,

        WORKSPACE_EXPOSED_PORTS: env.WORKSPACE_EXPOSED_PORTS,
        WORKSPACE_DOMAIN_SUFFIX: env.WORKSPACE_DOMAIN_SUFFIX,
    }));

export type EnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;
