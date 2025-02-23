import { config } from "@dotenvx/dotenvx";

import { type EnvironmentVariables, EnvironmentVariablesSchema } from "@/schemas/env";

export function loadEnv(): EnvironmentVariables {
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

/** Environment variables. Use this instead of `process.env` */
export const env = loadEnv();
