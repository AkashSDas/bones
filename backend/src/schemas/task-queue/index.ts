import { z } from "zod";

/**
 * Merge this to all schemas. `requestId` and `correlationId` are used
 * for logging purpose
 */
const BaseSchema = z.object({
    requestId: z.string(),
    correlationId: z.string(),
});

// ===================================
// Send Email Task
// ===================================

const ActivateAccountSchema = z
    .object({
        type: z.literal("activateAccount"),
        email: z.string().email(),
        activationToken: z.string(),
    })
    .merge(BaseSchema)
    .strict();

const ResetPasswordSchema = z
    .object({
        type: z.literal("resetPassword"),
        email: z.string().email(),
        resetToken: z.string(),
    })
    .merge(BaseSchema)
    .strict();

const SendEmailTaskSchema = z.union([ActivateAccountSchema, ResetPasswordSchema]);

// ===================================
// Exports
// ===================================

/** All Zod schemas related to task queues. */
export const TaskQueueSchemas = {
    SendEmailTaskSchema,
};

export type TaskQueue = {
    ActivateAccount: z.infer<typeof ActivateAccountSchema>;
    ResetPassword: z.infer<typeof ResetPasswordSchema>;
    SendEmailTask: z.infer<typeof SendEmailTaskSchema>;
};
