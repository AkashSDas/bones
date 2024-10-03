import { createRoute } from "@hono/zod-openapi";

import { commonOpenApiResponses, errorSchemas } from "@/utils/http";
import type { AppRouteHandler } from "@/utils/types";

import * as schemas from "./iam.schema";

export const accountSignup = createRoute({
    method: "post",
    path: "/account",
    tags: ["iam", "account"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: schemas.SignupRequestBodySchema,
                },
            },
        },
    },
    responses: {
        ...commonOpenApiResponses,
        201: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: schemas.SignupResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: errorSchemas.ZodValidationErrorSchema,
                },
            },
        },
        409: {
            description: "Account already exists",
            content: {
                "application/json": {
                    schema: errorSchemas.ConflictErrorSchema,
                },
            },
        },
    },
});

export type AccountSignupHandler = AppRouteHandler<typeof accountSignup>;
