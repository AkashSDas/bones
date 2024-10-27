import { createRoute } from "@hono/zod-openapi";

import { authenticate } from "@/middlewares/authenticate";
import { HttpErrorSchemas } from "@/schemas/http";
import { OpenApiResponses, status } from "@/utils/http";
import type { AppRouteHandler as Handler } from "@/utils/types";

import { IAMSchemas } from "./iam.schema";

const TAGS = {
    IAM: "IAM",
    ACCOUNT: "IAM Account",
    USER: "IAM User",
} as const;

export const accountSignup = createRoute({
    method: "post",
    path: "/account",
    tags: [TAGS.ACCOUNT],
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
    tags: [TAGS.ACCOUNT],
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
    tags: [TAGS.ACCOUNT],
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
    tags: [TAGS.ACCOUNT],
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
    tags: [TAGS.ACCOUNT],
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
    tags: [TAGS.ACCOUNT],
    request: {
        params: IAMSchemas.ResetAccountPasswordParams,
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
    path: "/login/refresh",
    tags: [TAGS.IAM],
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
    tags: [TAGS.USER],
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
    tags: [TAGS.USER],
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
    tags: [TAGS.USER],
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
    tags: [TAGS.USER],
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
    tags: [TAGS.USER],
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

export const userLogin = createRoute({
    method: "post",
    path: "/user/login",
    tags: [TAGS.USER],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: IAMSchemas.UserLoginRequestBody,
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
                    schema: IAMSchemas.UserLoginResponseBody,
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

export const myProfile = createRoute({
    method: "get",
    path: "/me",
    tags: [TAGS.IAM],
    middleware: [authenticate],
    responses: {
        ...OpenApiResponses.protectedAndValidationRoute,
        [status.OK]: {
            description: "Logged in user details",
            content: {
                "application/json": {
                    schema: IAMSchemas.MyProfileResponseBody,
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

export const logout = createRoute({
    method: "post",
    path: "/logout",
    tags: [TAGS.IAM],
    middleware: [authenticate],
    responses: {
        ...OpenApiResponses.protectedRoute,
        [status.NO_CONTENT]: {
            description: "User logged out",
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

    CreateUser: Handler<typeof createUser>;
    UpdateUser: Handler<typeof updateUser>;
    UserExists: Handler<typeof userExists>;
    DeleteUser: Handler<typeof deleteUser>;
    GetUsers: Handler<typeof getUsers>;
    UserLogin: Handler<typeof userLogin>;

    RefreshAccessToken: Handler<typeof refreshAccessToken>;
    MyProfile: Handler<typeof myProfile>;
    Logout: Handler<typeof logout>;
};
