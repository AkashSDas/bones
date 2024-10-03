import { z } from "@hono/zod-openapi";

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
