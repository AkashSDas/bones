import { OpenAPIHono } from "@hono/zod-openapi";

import { ZodValidationError } from "./http";
import type { AppBindings } from "./types";
import { formatZodErrors } from "./zod";

export function createHonoApp(): OpenAPIHono<AppBindings> {
    return new OpenAPIHono<AppBindings>({
        defaultHook(result, _c) {
            if (!result.success) {
                const errors = formatZodErrors(result.error);

                throw new ZodValidationError({
                    reason: "Zod Validation Error",
                    message: "Zod Validation Error",
                    payload: { errors },
                });
            }
        },
    });
}
