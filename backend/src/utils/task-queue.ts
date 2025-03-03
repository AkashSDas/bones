import { env } from "./env";

// Use this `.js` so that build is successful (since type=module is used in package.json
// all import around should .js and for 3rd only this one was causing issue -- not found
// module because it was looking for it with .js therefore added .js)
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import Bull from "bull";

import { log } from "@/lib/logger";
import { type TaskQueue as QueuePayload, TaskQueueSchemas } from "@/schemas/task-queue";

import { sendEmail } from "./email";
import { formatZodErrors } from "./zod";

// ================================
// Queues
// ================================

const config: Bull.QueueOptions = {
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
};

const sendEmailQueue = new Bull<unknown>("sendEmail", config);

// =================================
// Task Queue
// =================================

/** Use task queue to run long running task in the background */
class TaskQueue {
    // Here, using static methods for processing tasks and not instance methods. This is
    // because while using instance method, `this.<method>` is not a function while processing tasks

    public queues: Bull.Queue[];

    constructor() {
        // Add task queues here in order to make them available
        this.queues = [sendEmailQueue];
    }

    get queueAdapter(): BullAdapter[] {
        const queueAdapters = this.queues.map((queue) => new BullAdapter(queue));
        return queueAdapters;
    }

    // ==================================
    // Send Email
    // ==================================

    async addSendEmailTask(data: QueuePayload["SendEmailTask"]): Promise<void> {
        await sendEmailQueue.add(data, {
            attempts: 3,
            timeout: 5 * 60 * 1000,
        });
    }

    static async processSendEmailTask(job: Bull.Job): Promise<void> {
        const result = await TaskQueueSchemas.SendEmailTaskSchema.safeParseAsync(
            job.data,
        );

        if (result.success) {
            const data = result.data;

            switch (data.type) {
                case "activateAccount": {
                    await TaskQueue.sendActivateAccountEmail(data);
                    return;
                }
                case "resetPassword": {
                    await TaskQueue.sendResetPasswordEmail(data);
                    return;
                }
            }
        } else {
            const errors = formatZodErrors(result.error);
            log.error(`Failed to parse job data to send email: ${errors}`);
        }
    }

    static async sendActivateAccountEmail(data: QueuePayload["ActivateAccount"]) {
        const { email, activationToken, correlationId, requestId } = data;
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
    }

    static async sendResetPasswordEmail(data: QueuePayload["ResetPassword"]) {
        const { email, resetToken, correlationId, requestId } = data;
        const logData = { requestId, correlationId };

        try {
            const url = `${env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
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
    }
}

/** Task queues */
export const queue = new TaskQueue();

// =================================
// Process Task Queue
// ================================

sendEmailQueue.process(TaskQueue.processSendEmailTask);
