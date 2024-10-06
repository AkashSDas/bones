import { env } from "@/utils/env";

import { setCookie } from "hono/cookie";

import { dal } from "@/db/dal";
import { log } from "@/lib/logger";
import { auth } from "@/utils/auth";
import {
    BadRequestError,
    ConflictError,
    InternalServerError,
    status,
} from "@/utils/http";
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
        const activationTokenAge = new Date(new Date().getTime()).toUTCString();

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

export const activateAccount: routes.ActivateAccountHandler = async (c) => {
    const token = c.req.param("activationToken");
    const redirect = c.req.query("redirect");

    const hash = auth.hashToken(token);
    const accountId = await dal.account.findAccountByAcctivationToken(hash);

    if (accountId === null) {
        log.error("Invalid or expired token");

        if (redirect === "true") {
            return c.redirect(`${env.CLIENT_URL}/login?activation=failed`);
        } else {
            throw new BadRequestError({
                message: "Activation token is either invalid or expired",
            });
        }
    } else {
        try {
            await dal.account.activateAccount(accountId);
            log.info("Account activated and verified");

            if (redirect === "true") {
                return c.redirect(`${env.CLIENT_URL}/login`);
            } else {
                return c.json({ message: "Account activated successfully" });
            }
        } catch (e) {
            log.error(`Failed to activate account: ${e}`);

            if (redirect === "true") {
                return c.redirect(`${env.CLIENT_URL}/login?activation=failed`);
            } else {
                throw new InternalServerError({
                    message: "Failed to activate account",
                });
            }
        }
    }
};

export const accountExists: routes.AccountExistsHandler = async (c) => {
    const accountName = c.req.query("accountName");
    const email = c.req.query("email");

    if (!accountName && !email) {
        throw new BadRequestError({
            message: `At least one of the query parameters must be specified: 'accountName' or 'email'`,
        });
    }

    try {
        if (accountName && !email) {
            const exists = await dal.account.accountExistsByAccountName(accountName);
            return c.json({ exists }, status.OK);
        } else if (!accountName && email) {
            const exists = await dal.account.accountExistsByEmail(email);
            return c.json({ exists }, status.OK);
        } else {
            const exists = await Promise.all([
                dal.account.accountExistsByEmail(email!),
                dal.account.accountExistsByAccountName(accountName!),
            ]);
            return c.json({ exists: exists.every(Boolean) }, status.OK);
        }
    } catch (e) {
        log.error(`Failed to check if account exists: ${e}`);
        throw new InternalServerError({ message: "Failed to check if account exists" });
    }
};

// Routes to add
//
// TODO: Get email address unique and account name
// TODO: Login account
// TODO: Forgot password
// TODO: Reset password
// TODO: Refresh access token
// TODO: Change account status
//
// TODO: Create user
// TODO: Get username unique
// TODO: Update user
// TODO: Delete user
// TODO: Get users
//
// TODO: Create all of the above routes
// TODO: Refactor code
// TODO: Tests
