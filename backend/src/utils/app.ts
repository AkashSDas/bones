import { OpenAPIHono } from "@hono/zod-openapi";

import { ZodValidationError } from "./http";
import { formatZodErrors } from "./schema";
import type { AppBindings } from "./types";

export function createHonoApp() {
    return new OpenAPIHono<AppBindings>({
        defaultHook: (result, _c) => {
            if (!result.success) {
                const errors = formatZodErrors(result.error);
                throw new ZodValidationError({
                    reason: "Zod Validation Error",
                    message: "Zod validation error",
                    payload: { errors },
                });
            }
        },
    });
}
