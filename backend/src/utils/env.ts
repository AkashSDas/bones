import "dotenv/config";

import { z } from "zod";

const EnvironmentVariablesSchema = z.object({
    port: z.string().transform((v): number => {
        // NOTE: If you pass "8a0b", the port will be 8 number
        const port = parseInt(v, 10);

        if (isNaN(port)) {
            throw Error(`Invalid process.env.PORT, received '${v}'`);
        } else {
            return port;
        }
    }),
});

export async function loadEnv(): Promise<
    z.infer<typeof EnvironmentVariablesSchema>
> {
    try {
        return await EnvironmentVariablesSchema.parseAsync({
            port: process.env.PORT,
        });
    } catch (e) {
        console.error(`Failed to load environment variables: ${e}`);
        process.exit(1);
    }
}

/** Environment variables (validated) */
export const env = await loadEnv();
