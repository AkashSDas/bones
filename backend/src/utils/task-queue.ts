import { env } from "./env";

import { BullAdapter } from "@bull-board/api/bullAdapter";
import Bull from "bull";
import { z } from "zod";

import { log } from "@/lib/logger";

import { sendEmail } from "./email";
import { formatZodErrors } from "./schema";

// =================================
// Task Queue Schema
// ================================

const AccountActivationEmail = z
    .object({
        email: z.string().email(),
        activationToken: z.string(),
        requestId: z.string(),
        correlationId: z.string(),
    })
    .strict();

const ResetPasswordEmail = z
    .object({
        email: z.string().email(),
        resetToken: z.string(),
        requestId: z.string(),
        correlationId: z.string(),
    })
    .strict();

// ================================
// Queues
// ================================

const queueConfig = {
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
};

/** Send email for account activation purpose. */
const sendAccountActivationEmailQueue = new Bull<unknown>(
    "sendAccountActivationEmail",
    queueConfig,
);

/** Send email to reset password. */
const sendResetPasswordEmailQueue = new Bull<unknown>(
    "sendResetPasswordEmail",
    queueConfig,
);

// =================================
// Task Queue
// ================================

class TaskQueue {
    public queues: Bull.Queue[];

    constructor() {
        this.queues = [sendAccountActivationEmailQueue, sendResetPasswordEmailQueue];
    }

    get queueAdapter(): BullAdapter[] {
        const queueAdapters = this.queues.map((queue) => new BullAdapter(queue));
        return queueAdapters;
    }

    // ==================================
    // Send Email
    // ==================================

    async addSendAccountActivationEmailTask(
        data: z.infer<typeof AccountActivationEmail>,
    ) {
        await sendAccountActivationEmailQueue.add(data, {
            attempts: 3,
            timeout: 5 * 60 * 1000,
        });
    }

    static async processSendAccountActivationEmailTask(job: Bull.Job) {
        const result = await AccountActivationEmail.safeParseAsync(job.data);

        if (result.success) {
            const { email, activationToken, correlationId, requestId } = result.data;
            const logData = { requestId, correlationId };

            try {
                const url = `${env.APP_URL}/${activationToken}?redirect=true`;
                log.debug("Send account activation email", logData);

                await sendEmail({
                    subject: "Activate your Bones account",
                    to: email,
                    text: `Activate your account: ${url}`,
                    html: `Activate your account: <a href="${url}">${url}</a>`,
                });
            } catch (e) {
                log.error(`Failed to send email: ${e}`, logData);
            }
        } else {
            const errors = formatZodErrors(result.error);
            log.error(`Failed to parse job data to send email: ${errors}`);
        }
    }

    async addSendResetPasswordEmailTask(data: z.infer<typeof ResetPasswordEmail>) {
        await sendResetPasswordEmailQueue.add(data, {
            attempts: 3,
            timeout: 5 * 60 * 1000,
        });
    }

    static async processSendResetPasswordEmailTask(job: Bull.Job) {
        const result = await ResetPasswordEmail.safeParseAsync(job.data);

        if (result.success) {
            const { email, resetToken, correlationId, requestId } = result.data;
            const logData = { requestId, correlationId };

            try {
                const url = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
                log.debug("Send reset password email", logData);

                await sendEmail({
                    subject: "Reset password for Bones account",
                    to: email,
                    text: `Reset password for your account: ${url}`,
                    html: `Reset password for your account: <a href="${url}">${url}</a>`,
                });
            } catch (e) {
                log.error(`Failed to send email: ${e}`, logData);
            }
        } else {
            const errors = formatZodErrors(result.error);
            log.error(`Failed to parse job data to send email: ${errors}`);
        }
    }
}

export const taskQueue = new TaskQueue();

// =================================
// Process Task Queue
// ================================

sendAccountActivationEmailQueue.process(
    TaskQueue.processSendAccountActivationEmailTask,
);
sendResetPasswordEmailQueue.process(TaskQueue.processSendResetPasswordEmailTask);
