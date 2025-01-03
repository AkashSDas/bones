import { z } from "@hono/zod-openapi";

import { AccountClientSchema } from "@/db/models/account";
import { UserClientSchema } from "@/db/models/user";

// ===================================
// Account Signup
// ===================================

const AccountSignupRequestBody = z.object({
    email: z
        .string()
        .email()
        .openapi({
            example: "akash@gmail.com",
            description: `Unique email address for your account. It's used for 
            account recovery and some administrative functions`,
        }),
    accountName: z
        .string()
        .min(6)
        .max(255)
        .openapi({
            example: "Akash Bones",
            description: `Unique name for your account. You can change this name 
            in your account settings after you sign up`,
        }),
    password: z.string().min(8).max(255).openapi({ description: "Account password" }),
});

const AccountSignupResponseBody = z.object({
    message: z
        .string()
        .min(8)
        .max(255)
        .openapi({ example: "Account created successfully" }),
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpJ9" }),
});

// ===================================
// Activate Account
// ===================================

const ActivateAccountParams = z.object({
    activationToken: z.string().length(16).openapi({
        example: "9a7ce1f997862565",
        description: "Activation token",
    }),
});

const ActivateAccountQuery = z.object({
    redirect: z.enum(["true", "false"]).nullable().default("false"),
});

const ActivateAccountResponseBody = z.object({
    message: z
        .string()
        .min(8)
        .max(255)
        .openapi({ example: "Account activated successfully" }),
});

// ===================================
// Account Exists
// ===================================

const AccountExistsQuery = z.object({
    accountName: z.string().min(3).optional().openapi({ default: "AkashBones" }),
    email: z.string().email().optional().openapi({ default: "akash@gmail.com" }),
});

const AccountExistsResponseBody = z.object({
    exists: z.boolean().openapi({ example: false }),
});

// ===================================
// Account Login
// ===================================

const AccountLoginRequestBody = z.object({
    email: z
        .string()
        .email()
        .openapi({
            example: "akash@gmail.com",
            description: `Email address for your account. It's used for 
            account recovery and some administrative functions`,
        }),
    password: z.string().min(8).max(255).openapi({ description: "Account password" }),
});

const AccountLoginResponseBody = z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpJ9" }),
});

// ===================================
// Rest Account Password
// ===================================

const ResetAccountPasswordParams = z.object({
    resetToken: z.string().openapi({
        description: "Reset token that user received",
    }),
});

const ResetAccountPasswordRequestBody = z.object({
    email: z.string().email().openapi({
        example: "akash@gmail.com",
        description: "Email address for your account",
    }),
});

const ResetAccountPasswordResponseBody = z.object({
    message: z.string().openapi({
        example: "Password reset email sent to your email",
        description: "Success response message",
    }),
});

// ===================================
// Complete Account Reset Password
// ===================================

const CompleteResetAccountPasswordRequestBody = z.object({
    password: z.string().min(8).max(255).openapi({ description: "Account password" }),
});

const CompleteResetAccountPasswordResponseBody = z.object({
    message: z.string().openapi({
        example: "Successfully password reset",
        description: "Successfully password reset",
    }),
});

// ===================================
// Refresh Access Token
// ===================================

const RefreshAccessTokenCookies = z.object({
    refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpJ9" }),
});

const RefreshAccessTokenResponseBody = z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpJ9" }),
});

// ===================================
// Create User
// ===================================

const CreateUserRequestBody = z.object({
    username: z.string().min(3).max(255).openapi({
        description: "Unique username in an account",
        minLength: 3,
        maxLength: 255,
        example: "akash_dev",
    }),
    password: z
        .string()
        .min(8)
        .max(255)
        .openapi({ description: "User password", example: "Secure Password" })
        .optional(),
});

const CreateUserResponseBody = z.object({
    user: UserClientSchema.openapi({ description: "Newly created user" }),
    generatedPassword: z.string().optional().openapi({
        description: "This will be present if password is generated by the application",
    }),
});

// ===================================
// Update User
// ===================================

const UpdateUserParams = z.object({
    userId: z.string().uuid().openapi({ description: "User id" }),
});

const UpdateUserRequestBody = z
    .object({
        username: z
            .string()
            .min(3)
            .max(255)
            .openapi({
                description: "Unique username in an account",
                minLength: 3,
                maxLength: 255,
                example: "akash_dev",
            })
            .optional(),
        password: z
            .string()
            .min(8)
            .max(255)
            .openapi({ description: "User password", example: "Secure Password" })
            .optional(),
        generateNewPassword: z
            .boolean()
            .openapi({
                description: `Whether to generate a new password. Either 'password' 
            is provided or 'generateNewPassword' flag in order to update an user's password`,
                example: true,
            })
            .optional(),
        isBlocked: z
            .boolean()
            .openapi({ description: "Block a user", example: true })
            .optional(),
    })
    .refine((payload) => {
        if (
            payload.password !== undefined &&
            payload.generateNewPassword !== undefined
        ) {
            throw new Error(
                "Both 'password' and 'generateNewPassword' can not be provided",
            );
        }

        return payload;
    });

const UpdateUserResponseBody = z.object({
    message: z.string().openapi({ example: "Successfully updated user" }),
    generatedPassword: z.string().optional().openapi({
        description: "This will be present if password is generated by the application",
    }),
});

// ===================================
// Get Unique User Info
// ===================================

const UserExistsQuery = z.object({
    username: z.string().min(3).openapi({ default: "akash_dev" }),
});

const UserExistsResponseBody = z.object({
    exists: z.boolean().openapi({ example: false }),
});

// ===================================
// Delete User
// ===================================

const DeleteUserParam = z.object({
    userId: z.string().uuid().openapi({ description: "User id" }),
});

// ===================================
// Get Single User
// ===================================

const GetSingleUserParam = z.object({
    userId: z.string().uuid().openapi({ description: "User id" }),
});

const GetSingleUserResponseBody = z.object({
    user: UserClientSchema.openapi({ description: "IAM user" }),
});

// ===================================
// Get Many Users
// ===================================

const GetManyUsersQuery = z.object({
    offset: z
        .string()
        .transform((v) => {
            const page = parseInt(v, 10);
            if (isNaN(page) || page < 0) {
                throw new Error(`Invalid page value: ${v}`);
            }

            return page;
        })
        .default("0")
        .openapi({ description: "Page number" }),
    limit: z
        .string()
        .transform((v) => {
            const limit = parseInt(v, 10);
            if (isNaN(limit) || limit < 0) {
                throw new Error(`Invalid limit value: ${v}`);
            }

            return limit;
        })
        .default("20")
        .openapi({ description: "Page size" }),
    search: z.string().min(3).optional().openapi({ description: "Search query" }),
});

const GetManyUserResponseBody = z.object({
    total: z.number().int().min(0).openapi({ description: "Total number of users" }),
    users: z.array(UserClientSchema).openapi({ description: "List of users" }),
});

// ===================================
// User Login
// ===================================

const UserLoginRequestBody = z.object({
    accountId: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426655440000" }),
    username: z.string().openapi({
        example: "akash_dev",
        description: `Username of the user you want to login to an account`,
    }),
    password: z
        .string()
        .min(8)
        .max(255)
        .openapi({ description: "User account password" }),
});

const UserLoginResponseBody = z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpJ9" }),
});

// ===================================
// Logged In User
// ===================================

const MyProfileResponseBody = z.object({
    roles: z.array(z.enum(["admin", "user"])),
    account: AccountClientSchema,
    user: UserClientSchema.optional(),
});

// ===================================
// Exports
// ===================================

/** IAM Open API Zod Schemas */
export const IAMSchemas = {
    AccountSignupRequestBody,
    AccountSignupResponseBody,

    ActivateAccountParams,
    ActivateAccountQuery,
    ActivateAccountResponseBody,

    AccountExistsQuery,
    AccountExistsResponseBody,

    AccountLoginRequestBody,
    AccountLoginResponseBody,

    ResetAccountPasswordParams,
    ResetAccountPasswordRequestBody,
    ResetAccountPasswordResponseBody,

    CompleteResetAccountPasswordRequestBody,
    CompleteResetAccountPasswordResponseBody,

    RefreshAccessTokenCookies,
    RefreshAccessTokenResponseBody,

    CreateUserRequestBody,
    CreateUserResponseBody,

    UpdateUserParams,
    UpdateUserRequestBody,
    UpdateUserResponseBody,

    UserExistsQuery,
    UserExistsResponseBody,

    DeleteUserParam,

    GetSingleUserParam,
    GetSingleUserResponseBody,

    GetManyUsersQuery,
    GetManyUserResponseBody,

    UserLoginRequestBody,
    UserLoginResponseBody,

    MyProfileResponseBody,
};
