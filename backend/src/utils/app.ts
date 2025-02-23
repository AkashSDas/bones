import { OpenAPIHono } from "@hono/zod-openapi";

import { ZodValidationError } from "./http";
import type { AppBindings } from "./types";
import { formatZodErrors } from "./zod";

/** Return Hono app instance with OpenAPI validations and documentations */
export function createHonoApp(): OpenAPIHono<AppBindings> {
    return new OpenAPIHono<AppBindings>({
        defaultHook(result, _c) {
            if (!result.success) {
                // When Zod schema (defined for OpenAPI spec attributes for a route)
                // validation fails then we get inside of this this block. We format the
                // Zod errors and throw custom ZodValidationError
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
