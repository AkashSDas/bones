import { z } from "@hono/zod-openapi";

import { UserClientSchema } from "@/db/models/user";

// =======================================
// =======================================
// Accounts
// =======================================
// =======================================

// ===========================
// Create Account
// ===========================

export const SignupRequestBodySchema = z.object({
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
            description: `Unqiue name for your account. You can change this name 
            in your account settings after you sign up`,
        }),
    password: z.string().min(8).max(255).openapi({ description: "Account password" }),
});

export const SignupResponseBodySchema = z.object({
    message: z
        .string()
        .min(8)
        .max(255)
        .openapi({ example: "Account created successfully" }),
    accessToken: z
        .string()
        .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }),
});

// ===========================
// Activate Account
// ===========================

export const ActivateAccountParamsSchema = z.object({
    activationToken: z.string().length(16).openapi({
        example: "9a7ce1f997862565",
        description: "Activation token",
    }),
});

export const ActivateAccountQuerySchema = z.object({
    redirect: z.enum(["true", "false"]).nullable().default("false"),
});

export const ActivateAccountResponseBodySchema = z.object({
    message: z
        .string()
        .min(8)
        .max(255)
        .openapi({ example: "Account activated successfully" }),
});

// ===========================
// Unique Account Info
// ===========================

export const AccountExistsQuerySchema = z.object({
    accountName: z.string().min(3).optional().openapi({ default: "AkashBones" }),
    email: z.string().email().optional().openapi({ default: "akash@gmail.com" }),
});

export const AccountExistsBodySchema = z.object({
    exists: z.boolean().openapi({ example: false }),
});

// ===========================
// Account Login
// ===========================

export const LoginRequestBodySchema = z.object({
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

export const LoginResponseBodySchema = z.object({
    accessToken: z
        .string()
        .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }),
});

// ===========================
// Forgot Password
// ===========================

export const ResetPasswordRequestBodySchema = z.object({
    email: z.string().email().openapi({
        example: "akash@gmail.com",
        description: "Email address for your account",
    }),
});

export const ResetPasswordResponseBodySchema = z.object({
    message: z.string().openapi({
        example: "Password reset email sent to your email",
        description: "Success response message",
    }),
});

// ===========================
// Complete Reset Password
// ===========================

export const CompleteResetPasswordRequestBodySchema = z.object({
    password: z.string().min(8).max(255).openapi({ description: "Account password" }),
});

export const CompleteResetPasswordResponseBodySchema = z.object({
    message: z.string().openapi({
        example: "Successfully password reset",
        description: "Successfully password reset",
    }),
});

// ===========================
// Refresh Access Token
// ===========================

export const RefreshAccessTokenCookiesSchema = z.object({
    refreshToken: z
        .string()
        .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }),
});

export const RefreshAccessTokenResponseBodySchema = z.object({
    accessToken: z
        .string()
        .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" }),
});

// =======================================
// =======================================
// Users
// =======================================
// =======================================

// ===========================
// Create user
// ===========================

export const CreateUserRequestBodySchema = z.object({
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

export const CreateUserResponseBodySchema = z.object({
    user: UserClientSchema.openapi({ description: "Newly created user" }),
    generatedPassword: z.string().optional().openapi({
        description: "This will be present if password is generated by the application",
    }),
});

// ===========================
// Update user
// ===========================

export const UpdateUserParamsSchema = z.object({
    userId: z.string().uuid().openapi({ description: "User id" }),
});

export const UpdateUserRequestBodySchema = z
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

export const UpdateUserResponseBodySchema = z.object({
    message: z.string().openapi({ example: "Successfully updated user" }),
    generatedPassword: z.string().optional().openapi({
        description: "This will be present if password is generated by the application",
    }),
});

// ===========================
// Get unique user info
// ===========================

export const UserExistsQuerySchema = z.object({
    username: z.string().min(3).openapi({ default: "akash_dev" }),
});

export const UserExistsBodySchema = z.object({
    exists: z.boolean().openapi({ example: false }),
});

// ===========================
// Delete user
// ===========================

export const DeleteUserParamSchema = z.object({
    userId: z.string().uuid().openapi({ description: "User id" }),
});

// ===========================
// Get Many Users
// ===========================

export const GetManyUsersQuerySchema = z.object({
    page: z.number().int().min(0).default(0).openapi({ description: "Page number" }),
    limit: z.number().int().min(0).default(20).openapi({ description: "Page size" }),
    search: z.string().min(3).optional().openapi({ description: "Search query" }),
});

export const GetManyUserResponseBodySchema = z.object({
    total: z.number().int().min(0).openapi({ description: "Total number of users" }),
    users: z.array(UserClientSchema).openapi({ description: "List of users" }),
});
