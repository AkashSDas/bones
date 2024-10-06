import { z } from "@hono/zod-openapi";

import { AccountClientSchema } from "@/db/models/account";
import { errorSchemas } from "@/utils/http";

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

export const ActivateAccount400ResponseBodySchema = z.union([
    errorSchemas.ZodValidationErrorSchema,
    errorSchemas.BadRequestErrorSchema,
]);

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

export const Login400ResponseBodySchema = z.union([
    errorSchemas.ZodValidationErrorSchema,
    errorSchemas.BadRequestErrorSchema,
]);

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

export const ResetPassword400ResponseBodySchema = z.union([
    errorSchemas.ZodValidationErrorSchema,
    errorSchemas.BadRequestErrorSchema,
]);
