import { env } from "@/utils/env";

import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import { dal } from "@/db/dal";
import { log } from "@/lib/logger";
import { auth } from "@/utils/auth";
import { ConflictError, status } from "@/utils/http";
import { taskQueue } from "@/utils/task-queue";

import * as routes from "./iam.routes";

export const accountSignup: routes.AccountSignupHandler = async (c) => {
    const body = c.req.valid("json");
    const exists = await dal.account.checkAccountExists(body.email, body.accountName);

    if (exists) {
        throw new ConflictError({ message: "Account already exists" });
    } else {
        const [hash, salt] = await auth.hashPwd(body.password);

        const activationToken = auth.createToken();
        const activationHashToken = auth.hashToken(activationToken);
        const activationTokenAge = new Date(
            new Date().getTime() + 10 * 60 * 1000,
        ).toUTCString();

        const account = await dal.account.create({
            email: body.email,
            accountName: body.accountName,

            passwordHash: hash,
            passwordSalt: salt,
            passwordAge: new Date().toUTCString(),

            changeStatusToken: activationHashToken,
            changeStatusTokenAge: activationTokenAge,

            lastLoggedInAt: new Date().toUTCString(),
        });

        log.debug(`Account created successfully: ${account.accountId}`);

        const accessToken = auth.createAccessToken({ accountId: account.accountId });
        const refreshToken = auth.createRefreshToken({ accountId: account.accountId });

        setCookie(c, "refreshToken", refreshToken, {
            expires: env.REFRESH_TOKEN_AGE_IN_DATE,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        log.debug(`Adding send email task: ${account.accountId}`);
        await taskQueue.addSendEmailTask({
            email: body.email,
            accountId: account.accountId,
            activationHash: activationToken,
            requestId: c.get("requestId") ?? "N/A",
            correlationId: c.get("correlationId") ?? "N/A",
        });

        return c.json(
            { message: "Successfully created account", accessToken },
            status.CREATED,
        );
    }
};
