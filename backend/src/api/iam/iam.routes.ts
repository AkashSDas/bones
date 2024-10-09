import { createRoute } from "@hono/zod-openapi";

import { authenticate } from "@/middlewares/authenticate";
import { HttpErrorSchemas } from "@/schemas/http";
import { OpenApiResponses, status } from "@/utils/http";
import type { AppRouteHandler as Handler } from "@/utils/types";

import { IAMSchemas } from "./iam.schema";

export const accountSignup = createRoute({
    method: "post",
    path: "/account",
    tags: ["iam", "account"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountSignupRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.publicRoute,
        [status.CREATED]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountSignupResponseBody,
                },
            },
        },
        [status.BAD_REQUEST]: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ZodValidationErrorSchema,
                },
            },
        },
        [status.CONFLICT]: {
            description: "Account already exists",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ConflictErrorSchema,
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
        params: IAMSchemas.ActivateAccountParams,
        query: IAMSchemas.ActivateAccountQuery,
    },
    responses: {
        ...OpenApiResponses.publicAndValidationRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.ActivateAccountResponseBody,
                },
            },
        },
        [status.REDIRECT]: {
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
    },
});

export const accountExists = createRoute({
    method: "get",
    path: "/account/exists",
    tags: ["iam", "account"],
    request: {
        query: IAMSchemas.AccountExistsQuery,
    },
    responses: {
        ...OpenApiResponses.publicRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountExistsResponseBody,
                },
            },
        },
        [status.BAD_REQUEST]: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ZodValidationErrorSchema,
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
                    schema: IAMSchemas.AccountLoginRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.publicAndValidationRoute,
        [status.OK]: {
            description: "Successfully login",
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountLoginResponseBody,
                },
            },
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
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
                    schema: IAMSchemas.ResetAccountPasswordRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.publicAndValidationRoute,
        [status.OK]: {
            description: "Successfully login",
            content: {
                "application/json": {
                    schema: IAMSchemas.ResetAccountPasswordResponseBody,
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
                    schema: IAMSchemas.CompleteResetAccountPasswordRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.publicAndValidationRoute,
        [status.OK]: {
            description: "Successfully password reset",
            content: {
                "application/json": {
                    schema: IAMSchemas.CompleteResetAccountPasswordResponseBody,
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
        cookies: IAMSchemas.RefreshAccessTokenCookies,
    },
    responses: {
        ...OpenApiResponses.protectedRoute,
        [status.OK]: {
            description: "Successfully password reset",
            content: {
                "application/json": {
                    schema: IAMSchemas.RefreshAccessTokenResponseBody,
                },
            },
        },
    },
});

export const createUser = createRoute({
    method: "post",
    path: "/user",
    tags: ["iam", "user"],
    middleware: [authenticate],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: IAMSchemas.CreateUserRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.protectedAndValidationRoute,
        [status.CREATED]: {
            description: "Successfully created user",
            content: {
                "application/json": {
                    schema: IAMSchemas.CreateUserResponseBody,
                },
            },
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
                },
            },
        },
        [status.FORBIDDEN]: {
            description: "Forbidden",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ForbiddenErrorSchema,
                },
            },
        },
    },
});

export const updateUser = createRoute({
    method: "patch",
    path: "/user/{userId}",
    tags: ["iam", "user"],
    middleware: [authenticate],
    request: {
        params: IAMSchemas.UpdateUserParams,
        body: {
            content: {
                "application/json": {
                    schema: IAMSchemas.UpdateUserRequestBody,
                },
            },
        },
    },
    responses: {
        ...OpenApiResponses.protectedAndValidationRoute,
        [status.OK]: {
            description: "Successfully updated user",
            content: {
                "application/json": {
                    schema: IAMSchemas.UpdateUserResponseBody,
                },
            },
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
                },
            },
        },
        [status.FORBIDDEN]: {
            description: "Forbidden",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ForbiddenErrorSchema,
                },
            },
        },
    },
});

export const userExists = createRoute({
    method: "get",
    path: "/user/exists",
    tags: ["iam", "user"],
    middleware: [authenticate],
    request: {
        query: IAMSchemas.UserExistsQuery,
    },
    responses: {
        ...OpenApiResponses.protectedAndValidationRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.UserExistsResponseBody,
                },
            },
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
                },
            },
        },
    },
});

export const deleteUser = createRoute({
    method: "delete",
    path: "/user/{userId}",
    tags: ["iam", "user"],
    middleware: [authenticate],
    request: {
        params: IAMSchemas.DeleteUserParam,
    },
    responses: {
        ...OpenApiResponses.protectedAndValidationRoute,
        [status.NO_CONTENT]: {
            description: "Successfully deleted",
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
                },
            },
        },
        [status.FORBIDDEN]: {
            description: "Forbidden",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ForbiddenErrorSchema,
                },
            },
        },
    },
});

export const getUsers = createRoute({
    method: "get",
    path: "/user",
    tags: ["iam", "user"],
    middleware: [authenticate],
    request: {
        query: IAMSchemas.GetManyUsersQuery,
    },
    responses: {
        ...OpenApiResponses.protectedAndValidationRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.GetManyUserResponseBody,
                },
            },
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
                },
            },
        },
        [status.FORBIDDEN]: {
            description: "Forbidden",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ForbiddenErrorSchema,
                },
            },
        },
    },
});

// ===============================
// Types
// ===============================

export type IAMHandler = {
    AccountSignup: Handler<typeof accountSignup>;
    ActivateAccount: Handler<typeof activateAccount>;
    AccountExists: Handler<typeof accountExists>;
    AccountLogin: Handler<typeof accountLogin>;
    ResetPassword: Handler<typeof resetPassword>;
    CompleteResetPassword: Handler<typeof completeResetPassword>;
    RefreshAccessToken: Handler<typeof refreshAccessToken>;

    CreateUser: Handler<typeof createUser>;
    UpdateUser: Handler<typeof updateUser>;
    UserExists: Handler<typeof userExists>;
    DeleteUser: Handler<typeof deleteUser>;
    GetUsers: Handler<typeof getUsers>;
};
