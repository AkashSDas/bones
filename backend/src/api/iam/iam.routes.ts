import { createRoute } from "@hono/zod-openapi";

import { accountStatus } from "@/middlewares/account-status";
import { authenticate } from "@/middlewares/authenticate";
import { rbac } from "@/middlewares/rbac";
import { HttpErrorSchemas } from "@/schemas/http";
import { OpenApiResponses, status } from "@/utils/http";
import type { AppRouteHandler as Handler } from "@/utils/types";

import { IAMSchemas } from "./iam.schema";

const TAGS = {
    IAM: "IAM",
    ACCOUNT: "IAM Account",
    USER: "IAM User",
} as const;

// =========================================
// Account Endpoints
// =========================================

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
        ...OpenApiResponses.publicValidatedRoute,
        [status.CREATED]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountSignupResponseBody,
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
        ...OpenApiResponses.publicValidatedRoute,
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
        ...OpenApiResponses.publicValidatedRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountExistsResponseBody,
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
        ...OpenApiResponses.publicValidatedNotFoundRoute,
        [status.OK]: {
            description: "Successfully login",
            content: {
                "application/json": {
                    schema: IAMSchemas.AccountLoginResponseBody,
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
        ...OpenApiResponses.publicValidatedNotFoundRoute,
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
        ...OpenApiResponses.publicValidatedRoute,
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

// =========================================
// User Endpoints
// =========================================

export const createUser = createRoute({
    method: "post",
    path: "/user",
    tags: [TAGS.USER],
    middleware: [
        authenticate,
        rbac.iamAccountWideWrite,
        accountStatus.allowOnlyActiveAccount,
    ],
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
        ...OpenApiResponses.rbacRoute,
        [status.CREATED]: {
            description: "Successfully created user",
            content: {
                "application/json": {
                    schema: IAMSchemas.CreateUserResponseBody,
                },
            },
        },
    },
});

export const updateUser = createRoute({
    method: "patch",
    path: "/user/{userId}",
    tags: [TAGS.USER],
    middleware: [authenticate, rbac.iamAccountWideWrite],
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
        ...OpenApiResponses.rbacRoute,
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
    },
});

export const userExists = createRoute({
    method: "get",
    path: "/user/exists",
    tags: [TAGS.USER],
    middleware: [authenticate, rbac.iamAccountWideRead],
    request: {
        query: IAMSchemas.UserExistsQuery,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.UserExistsResponseBody,
                },
            },
        },
    },
});

export const deleteUser = createRoute({
    method: "delete",
    path: "/user/{userId}",
    tags: [TAGS.USER],
    middleware: [authenticate, rbac.iamAccountWideWrite],
    request: {
        params: IAMSchemas.DeleteUserParam,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
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
    },
});

export const getUser = createRoute({
    method: "get",
    path: "/user/{userId}",
    tags: [TAGS.USER],
    middleware: [authenticate, rbac.iamAccountWideRead],
    request: {
        params: IAMSchemas.GetSingleUserParam,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "User found",
            content: {
                "application/json": {
                    schema: IAMSchemas.GetSingleUserResponseBody,
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

export const getUsers = createRoute({
    method: "get",
    path: "/user",
    tags: [TAGS.USER],
    // middleware: [authenticate, rbac.iamServiceWideRead],
    middleware: [authenticate],
    request: {
        query: IAMSchemas.GetManyUsersQuery,
    },
    responses: {
        ...OpenApiResponses.rbacRoute,
        [status.OK]: {
            description: "Success response",
            content: {
                "application/json": {
                    schema: IAMSchemas.GetManyUserResponseBody,
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
        ...OpenApiResponses.publicValidatedNotFoundRoute,
        [status.OK]: {
            description: "Successfully login",
            content: {
                "application/json": {
                    schema: IAMSchemas.UserLoginResponseBody,
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
        ...OpenApiResponses.protectedRoute,
        [status.OK]: {
            description: "Logged in user details",
            content: {
                "application/json": {
                    schema: IAMSchemas.MyProfileResponseBody,
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
    GetUser: Handler<typeof getUser>;
    GetUsers: Handler<typeof getUsers>;
    UserLogin: Handler<typeof userLogin>;

    RefreshAccessToken: Handler<typeof refreshAccessToken>;
    MyProfile: Handler<typeof myProfile>;
    Logout: Handler<typeof logout>;
};
