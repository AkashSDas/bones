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

const SendAccountActivationEmail = z
    .object({
        email: z.string().email(),
        activationHash: z.string(),
        requestId: z.string(),
        correlationId: z.string(),
    })
    .strict();

// ================================
// Queues
// ================================

/** Send email for application purposes. */
const sendEmailQueue = new Bull<unknown>("sendEmailQueue", {
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
});

// =================================
// Task Queue
// ================================

class TaskQueue {
    public queues: Bull.Queue[];

    constructor() {
        this.queues = [sendEmailQueue];
    }

    get queueAdapter(): BullAdapter[] {
        const queueAdapters = this.queues.map((queue) => new BullAdapter(queue));
        return queueAdapters;
    }

    // ==================================
    // Send Email
    // ==================================

    async addSendEmailTask(data: z.infer<typeof SendAccountActivationEmail>) {
        await sendEmailQueue.add(data, {
            attempts: 3,
            timeout: 5 * 60 * 1000,
        });
    }

    static async processSendEmailTask(job: Bull.Job) {
        const result = await SendAccountActivationEmail.safeParseAsync(job.data);

        if (result.success) {
            const { email, activationHash, correlationId, requestId } = result.data;
            const logData = { requestId, correlationId };

            try {
                const url = `${env.APP_URL}/${activationHash}?redirect=true`;
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
}

export const taskQueue = new TaskQueue();

// =================================
// Process Task Queue
// ================================

sendEmailQueue.process(TaskQueue.processSendEmailTask);
