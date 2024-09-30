import { createRoute } from "@hono/zod-openapi";

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
        200: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: schemas.SignupResponseBodySchema,
                },
            },
        },
    },
});

export type AccountSignupHandler = AppRouteHandler<typeof accountSignup>;
