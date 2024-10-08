import { createRoute } from "@hono/zod-openapi";

import { authenticateMiddleware } from "@/middlewares/authenticate";
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

export const activateAccount = createRoute({
    method: "get",
    path: "/account/activate/{activationToken}",
    tags: ["iam", "account"],
    request: {
        params: schemas.ActivateAccountParamsSchema,
        query: schemas.ActivateAccountQuerySchema,
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: schemas.ActivateAccountResponseBodySchema,
                },
            },
        },
        302: {
            description: "Redirect after successful/failed account activation",
            headers: {
                Location: {
                    description: "The URL of the page to redirect to",
                    schema: {
                        type: "string",
                        examples: [
                            "https://example.com/login?activation=failed",
                            "https://example.com/login?activation=success",
                        ],
                    },
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
    },
});

export const accountExists = createRoute({
    method: "get",
    path: "/account/exists",
    tags: ["iam", "account"],
    request: {
        query: schemas.AccountExistsQuerySchema,
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: schemas.AccountExistsBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.ZodValidationErrorSchema,
                },
            },
        },
    },
});

export const accountLogin = createRoute({
    method: "post",
    path: "/account/login",
    tags: ["iam", "account"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: schemas.LoginRequestBodySchema,
                },
            },
        },
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Successfully login",
            content: {
                "application/json": {
                    schema: schemas.LoginResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
    },
});

export const resetPassword = createRoute({
    method: "post",
    path: "/account/reset-password",
    tags: ["iam", "account"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: schemas.ResetPasswordRequestBodySchema,
                },
            },
        },
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Successfully login",
            content: {
                "application/json": {
                    schema: schemas.ResetPasswordResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
    },
});

export const completeResetPassword = createRoute({
    method: "post",
    path: "/account/reset-password/{resetToken}",
    tags: ["iam", "account"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: schemas.CompleteResetPasswordRequestBodySchema,
                },
            },
        },
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Successfully password reset",
            content: {
                "application/json": {
                    schema: schemas.CompleteResetPasswordResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
    },
});

export const refreshAccessToken = createRoute({
    method: "get",
    path: "/account/login/refresh",
    tags: ["iam", "account"],
    request: {
        cookies: schemas.RefreshAccessTokenCookiesSchema,
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Successfully password reset",
            content: {
                "application/json": {
                    schema: schemas.RefreshAccessTokenResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: errorSchemas.UnauthorizedErrorSchema,
                },
            },
        },
    },
});

export const createUser = createRoute({
    method: "post",
    path: "/user",
    tags: ["iam", "user"],
    middleware: [authenticateMiddleware],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: schemas.CreateUserRequestBodySchema,
                },
            },
        },
    },
    responses: {
        ...commonOpenApiResponses,
        201: {
            description: "Successfully created user",
            content: {
                "application/json": {
                    schema: schemas.CreateUserResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: errorSchemas.UnauthorizedErrorSchema,
                },
            },
        },
        404: {
            description: "Not Found",
            content: {
                "application/json": {
                    schema: errorSchemas.NotFoundErrorSchema,
                },
            },
        },
    },
});

export const updateUser = createRoute({
    method: "patch",
    path: "/user/{userId}",
    tags: ["iam", "user"],
    middleware: [authenticateMiddleware],
    request: {
        params: schemas.UpdateUserParamsSchema,
        body: {
            content: {
                "application/json": {
                    schema: schemas.UpdateUserRequestBodySchema,
                },
            },
        },
    },
    responses: {
        ...commonOpenApiResponses,
        200: {
            description: "Successfully updated user",
            content: {
                "application/json": {
                    schema: schemas.UpdateUserResponseBodySchema,
                },
            },
        },
        400: {
            description: "Validation Error",
            content: {
                "application/json": {
                    schema: errorSchemas.UserBadRequestScheams,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: errorSchemas.UnauthorizedErrorSchema,
                },
            },
        },
    },
});

// ===============================
// Types
// ===============================

export type AccountSignupHandler = AppRouteHandler<typeof accountSignup>;
export type ActivateAccountHandler = AppRouteHandler<typeof activateAccount>;
export type AccountExistsHandler = AppRouteHandler<typeof accountExists>;
export type AccountLoginHandler = AppRouteHandler<typeof accountLogin>;
export type ResetPasswordHandler = AppRouteHandler<typeof resetPassword>;
export type CompleteResetPasswordHandler = AppRouteHandler<
    typeof completeResetPassword
>;
export type RefreshAccessTokenHandler = AppRouteHandler<typeof refreshAccessToken>;

export type CreateUserHandler = AppRouteHandler<typeof createUser>;
export type UpdateUserHandler = AppRouteHandler<typeof updateUser>;
