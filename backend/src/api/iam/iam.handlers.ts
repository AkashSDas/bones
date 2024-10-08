import { env } from "@/utils/env";

import { getCookie, setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

import { dal } from "@/db/dal";
import { log } from "@/lib/logger";
import { auth } from "@/utils/auth";
import {
    BadRequestError,
    ConflictError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    status,
} from "@/utils/http";
import { taskQueue } from "@/utils/task-queue";

import * as routes from "./iam.routes";

export const accountSignup: routes.AccountSignupHandler = async (c) => {
    const body = c.req.valid("json");
    const exists = await dal.account.exists(body.email, body.accountName);

    if (exists) {
        throw new ConflictError({ message: "Account already exists" });
    } else {
        const [hash] = await auth.hashPwd(body.password);

        const activationToken = auth.createToken();
        const activationHashToken = auth.hashToken(activationToken);
        const activationTokenAge = new Date(new Date().getTime()).toUTCString();

        const account = await dal.account.create({
            email: body.email,
            accountName: body.accountName,

            passwordHash: hash,
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
        await taskQueue.addSendAccountActivationEmailTask({
            email: body.email,
            activationToken,
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
    const accountId = await dal.account.findByAcctivationToken(hash);

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
            await dal.account.activate(accountId);
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
            const exists = await dal.account.existsByAccountName(accountName);
            return c.json({ exists }, status.OK);
        } else if (!accountName && email) {
            const exists = await dal.account.existsByEmail(email);
            return c.json({ exists }, status.OK);
        } else {
            const exists = await Promise.all([
                dal.account.existsByEmail(email!),
                dal.account.existsByAccountName(accountName!),
            ]);
            return c.json({ exists: exists.every(Boolean) }, status.OK);
        }
    } catch (e) {
        log.error(`Failed to check if account exists: ${e}`);
        throw new InternalServerError({ message: "Failed to check if account exists" });
    }
};

export const accountLogin: routes.AccountLoginHandler = async (c) => {
    const body = c.req.valid("json");
    const info = await dal.account.getHashInfo(body.email);

    if (info === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else {
        const isRightPwd = await auth.verifyPwd(body.password, info.passwordHash);

        if (!isRightPwd) {
            throw new BadRequestError({ message: "Wrong password" });
        } else {
            const accessToken = auth.createAccessToken({ accountId: info.accountId });
            const refreshToken = auth.createRefreshToken({ accountId: info.accountId });

            setCookie(c, "refreshToken", refreshToken, {
                expires: env.REFRESH_TOKEN_AGE_IN_DATE,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });

            return c.json({ accessToken }, status.OK);
        }
    }
};

export const resetPassword: routes.ResetPasswordHandler = async (c) => {
    const body = c.req.valid("json");
    const exists = await dal.account.existsByEmail(body.email);

    if (!exists) {
        throw new BadRequestError({ message: "Account doesn't exists" });
    } else {
        const resetToken = auth.createToken();
        const resetHashToken = auth.hashToken(resetToken);
        const resetTokenAge = new Date(new Date().getTime());

        await dal.account.setResetToken(body.email, resetHashToken, resetTokenAge);

        log.debug("Adding send email task");
        await taskQueue.addSendResetPasswordEmailTask({
            email: body.email,
            resetToken,
            requestId: c.get("requestId") ?? "N/A",
            correlationId: c.get("correlationId") ?? "N/A",
        });

        return c.json(
            { message: "Successfully sent reset token to registered email" },
            status.OK,
        );
    }
};

export const completeResetPassword: routes.CompleteResetPasswordHandler = async (c) => {
    const body = c.req.valid("json");
    const token = c.req.param("resetToken");

    const hash = auth.hashToken(token);
    const accountId = await dal.account.findByResetPasswordToken(hash);

    if (accountId === null) {
        throw new BadRequestError({
            message: "Activation token is either invalid or expired",
        });
    } else {
        const [hash] = await auth.hashPwd(body.password);
        await dal.account.setPassword(accountId, hash);

        return c.json({ message: "Successfully password reset" }, status.OK);
    }
};

export const refreshAccessToken: routes.RefreshAccessTokenHandler = async (c) => {
    const token = getCookie(c, "refreshToken");

    if (token === undefined) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Missing refresh token",
        });
    } else {
        try {
            const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
            const payload = await auth.getAccessTokenContent(decoded);

            if (payload === null) {
                throw new Error("Payload content is missing");
            } else {
                const token = auth.createAccessToken({ accountId: payload.accountId });
                return c.json({ accessToken: token }, status.OK);
            }
        } catch (e) {
            throw new UnauthorizedError({
                message: "Unauthorized",
                reason: "Invalid or expired refresh token",
            });
        }
    }
};

export const createUser: routes.CreateUserHandler = async (c) => {
    const { username, password } = c.req.valid("json");
    const { accountId } = c.get("jwtContent")!;
    const exists = await dal.user.existsByUsername(username, accountId);

    if (exists === null) {
        throw new BadRequestError({
            message: `Username '${username}' is already used by an user in this account`,
        });
    } else {
        const pwd = password ?? auth.generateRandomPassword(16);
        const isGeneratedPwd = password === undefined;
        const [hash] = await auth.hashPwd(pwd);

        const user = await dal.user.create({
            accountId: exists.accountId,
            username,
            passwordHash: hash,
            passwordAge: new Date().toUTCString(),
            lastLoggedInAt: new Date().toUTCString(),
        });

        return c.json(
            { user, generatedPassword: isGeneratedPwd ? pwd : undefined },
            status.CREATED,
        );
    }
};

// Routes to add
//
// TODO: Get username unique
// TODO: Update user
// TODO: Delete user
// TODO: Get users
//
// TODO: Create all of the above routes
// TODO: Refactor code
// TODO: Tests
