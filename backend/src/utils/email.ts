import { env } from "./env";

import { createTransport } from "nodemailer";

type EmailOptions = {
    to: string;
    subject: string;
    text: string;
    html: string;
};

const transporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
    },
});

export async function sendEmail(opts: EmailOptions) {
    return await transporter.sendMail({
        from: env.FROM_EMAIL,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
    });
}
