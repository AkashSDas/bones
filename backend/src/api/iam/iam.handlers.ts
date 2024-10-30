import { env } from "@/utils/env";

import jwt from "jsonwebtoken";
import { z } from "zod";

import { dal } from "@/db/dal";
import { UserClientSchema } from "@/db/models/user";
import { log } from "@/lib/logger";
import { auth } from "@/utils/auth";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    status,
} from "@/utils/http";
import { queue } from "@/utils/task-queue";

import { type IAMHandler } from "./iam.routes";
import { IAMSchemas } from "./iam.schema";

const TOKEN_EXPIRY = 10 * 60 * 1000; // 10 mins

// =========================================
// Account Endpoints
// =========================================

export const accountSignup: IAMHandler["AccountSignup"] = async (c) => {
    const body = c.req.valid("json");
    const exists = await dal.account.exists(body.email, body.accountName);

    if (exists) {
        throw new ConflictError({ message: "Account already exists" });
    } else {
        const [hash] = await auth.hashPwd(body.password);

        const activationToken = auth.createToken();
        const activationHashToken = auth.hashToken(activationToken);
        const activationTokenAge = new Date(new Date().getTime() + TOKEN_EXPIRY);

        const account = await dal.account.create({
            email: body.email,
            accountName: body.accountName,

            passwordHash: hash,
            passwordAge: new Date().toISOString(),

            changeStatusToken: activationHashToken,
            changeStatusTokenAge: activationTokenAge.toISOString(),

            lastLoggedInAt: new Date().toISOString(),
        });

        log.info(`Account created successfully: ${account.accountId}`);

        const accessToken = auth.createAccessToken({
            type: "account",
            accountId: account.accountId,
        });
        const refreshToken = auth.createRefreshToken({
            type: "account",
            accountId: account.accountId,
        });

        c.get("session").set("refreshToken", refreshToken);

        log.info(`Adding send email task: ${account.accountId}`);
        await queue.addSendEmailTask({
            type: "activateAccount",
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

export const activateAccount: IAMHandler["ActivateAccount"] = async (c) => {
    const { activationToken: token } = c.req.valid("param");
    const { redirect } = c.req.valid("query");

    try {
        const hash = auth.hashToken(token);
        const accountId = await dal.account.findByActivationToken(hash, new Date());

        if (accountId === null) {
            log.error("Invalid or expired activation token");

            if (redirect === "true") {
                return c.redirect(`${env.CLIENT_URL}/auth/activate?status=failed`);
            } else {
                throw new BadRequestError({
                    message: "Activation token is either invalid or expired",
                });
            }
        } else {
            await dal.account.activate(accountId);
            log.info("Account activated and verified");

            if (redirect === "true") {
                return c.redirect(`${env.CLIENT_URL}/auth/activate?status=success`);
            } else {
                return c.json({ message: "Account activated successfully" });
            }
        }
    } catch (e) {
        if (e instanceof BadRequestError) {
            throw e;
        } else {
            log.error(`Failed to activate account: ${e}`);

            if (redirect === "true") {
                return c.redirect(`${env.CLIENT_URL}/auth/activate?status=failed`);
            } else {
                throw new InternalServerError({
                    message: "Failed to activate account",
                    cause: e,
                });
            }
        }
    }
};

export const accountExists: IAMHandler["AccountExists"] = async (c) => {
    const { accountName, email } = c.req.valid("query");

    if (!accountName && !email) {
        throw new BadRequestError({
            message: `At least one of the query parameters must be specified: 'accountName' or 'email'`,
        });
    }

    if (accountName && !email) {
        const exists = await dal.account.existsByAccountName(accountName);
        return c.json({ exists }, status.OK);
    }

    if (!accountName && email) {
        const exists = await dal.account.existsByEmail(email);
        return c.json({ exists }, status.OK);
    }

    const exists = await Promise.all([
        dal.account.existsByEmail(email!),
        dal.account.existsByAccountName(accountName!),
    ]);

    return c.json({ exists: exists.every(Boolean) }, status.OK);
};

export const accountLogin: IAMHandler["AccountLogin"] = async (c) => {
    const body = c.req.valid("json");
    const info = await dal.account.findHashDetails(body.email);

    if (info === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else {
        const isRightPwd = await auth.verifyPwd(body.password, info.passwordHash);

        if (!isRightPwd) {
            throw new BadRequestError({ message: "Wrong password" });
        } else {
            const accessToken = auth.createAccessToken({
                type: "account",
                accountId: info.accountId,
            });
            const refreshToken = auth.createRefreshToken({
                type: "account",
                accountId: info.accountId,
            });

            c.get("session").set("refreshToken", refreshToken);

            await dal.account.setLastLogin(info.accountId);

            return c.json({ accessToken }, status.OK);
        }
    }
};

export const resetPassword: IAMHandler["ResetPassword"] = async (c) => {
    const body = c.req.valid("json");
    const exists = await dal.account.existsByEmail(body.email);

    if (!exists) {
        throw new BadRequestError({ message: "Account doesn't exists" });
    } else {
        const resetToken = auth.createToken();
        const resetHashToken = auth.hashToken(resetToken);
        const resetTokenAge = new Date(new Date().getTime() + TOKEN_EXPIRY);

        await dal.account.setResetToken(body.email, resetHashToken, resetTokenAge);

        log.info("Adding send email task");
        await queue.addSendEmailTask({
            type: "resetPassword",
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

export const completeResetPassword: IAMHandler["CompleteResetPassword"] = async (c) => {
    const body = c.req.valid("json");
    const token = c.req.param("resetToken");

    const hash = auth.hashToken(token);
    const accountId = await dal.account.findByResetPasswordToken(hash, new Date());

    if (accountId === null) {
        throw new BadRequestError({
            message: "Activation token is either invalid or expired",
        });
    } else {
        const [hash] = await auth.hashPwd(body.password);
        await dal.account.setPassword(accountId, hash);
        log.info("Successfully changed password");
        return c.json({ message: "Successfully password reset" }, status.OK);
    }
};

export const refreshAccessToken: IAMHandler["RefreshAccessToken"] = async (c) => {
    const token = c.get("session").get("refreshToken");

    if (token === null) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Missing refresh token",
        });
    }

    try {
        const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
        const payload = await auth.extractJWTContent(decoded);

        if (payload === null) {
            throw new Error("Payload content is missing");
        } else {
            let token: string;

            switch (payload.type) {
                case "account":
                    token = auth.createAccessToken({
                        type: "account",
                        accountId: payload.accountId,
                    });
                    break;
                case "user":
                    token = auth.createAccessToken({
                        type: "user",
                        accountId: payload.accountId,
                        userId: payload.userId,
                    });
                    break;
                default:
                    log.error("Invalid JWT payload type");
                    throw new Error("Invalid JWT payload type");
            }

            return c.json({ accessToken: token }, status.OK);
        }
    } catch (e) {
        throw new UnauthorizedError({
            message: "Unauthorized",
            reason: "Invalid or expired refresh token",
        });
    }
};

// =========================================
// User Endpoints
// =========================================

export const createUser: IAMHandler["CreateUser"] = async (c) => {
    const { username, password } = c.req.valid("json");
    const content = c.get("accountJWTContent");

    if (content === undefined) {
        throw new ForbiddenError({ message: "You don't account (admin) privileges" });
    }

    const { accountId } = content;
    const [exists, id] = await Promise.all([
        dal.user.existsByUsername(username, accountId),
        dal.account.findAccountById(accountId),
    ]);

    if (id === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else if (exists !== null) {
        throw new BadRequestError({
            message: `Username '${username}' is already used by an user in this account`,
        });
    } else {
        const pwd = password ?? auth.generateRandomPassword(16);
        const isGeneratedPwd = password === undefined;
        const [hash] = await auth.hashPwd(pwd);

        const user = await dal.user.create({
            accountId: id,
            username,
            passwordHash: hash,
            passwordAge: new Date().toISOString(),
            lastLoggedInAt: new Date().toISOString(),
        });

        log.info("Create a new user");
        return c.json(
            {
                user: await UserClientSchema.parseAsync(user),
                generatedPassword: isGeneratedPwd ? pwd : undefined,
            },
            status.CREATED,
        );
    }
};

// TODO: Throw forbidden error when requester (account) doesn't have access to user.
// Current this request is skipped as DB makes changes based on relationships which
// doesn't exists
export const updateUser: IAMHandler["UpdateUser"] = async (c) => {
    const update = c.req.valid("json");
    const { userId } = c.req.valid("param");
    const content = c.get("accountJWTContent");

    if (content === undefined) {
        throw new ForbiddenError({ message: "You don't account (admin) privileges" });
    }

    const { accountId } = content;
    const exists = await dal.user.existsByUserId(userId, accountId);

    if (exists === null) {
        throw new NotFoundError({ message: "User doesn't exists" });
    } else {
        let generatedPwd: null | string = null;

        if (update.isBlocked) {
            log.info("Blocking user and ignoring other updates (if present)");
            await dal.user.setUserInfo(exists.userId, exists.accountId, {
                isBlocked: update.isBlocked,
            });
        } else {
            if (update.password || update.generateNewPassword) {
                let pwd: string | undefined = undefined;

                if (update.generateNewPassword === true) {
                    pwd = auth.generateRandomPassword(16);
                    generatedPwd = pwd;
                    log.info("Generated a new password for user");
                } else {
                    pwd = update.password;
                }

                if (pwd !== undefined) {
                    const [hash] = await auth.hashPwd(pwd);
                    await dal.user.setUserInfo(exists.userId, exists.accountId, {
                        passwordHash: hash,
                        passwordAge: new Date().toISOString(),
                    });
                    log.info("Saved user password");
                }

                // REMOVING FIELDS THAT ARE NOT PASSWORD USER TABLE TO UPDATE
                delete update.password;
                delete update.generateNewPassword;
            }

            if (update.username) {
                const exists = await dal.user.existsByUsername(
                    update.username,
                    accountId,
                );

                if (exists !== null) {
                    throw new BadRequestError({
                        message: `Username '${update.username}' is already used by an user in this account`,
                    });
                }
            }

            if (Object.values(update).length > 0) {
                await dal.user.setUserInfo(exists.userId, exists.accountId, update);
                log.info("Updated user details");
            }
        }

        const response: z.infer<typeof IAMSchemas.UpdateUserResponseBody> = {
            message: "User updated",
        };

        if (generatedPwd) {
            response["generatedPassword"] = generatedPwd;
        }

        return c.json(response, status.OK);
    }
};

export const userExists: IAMHandler["UserExists"] = async (c) => {
    const { username } = c.req.valid("query");
    const content = c.get("accountJWTContent");

    if (content === undefined) {
        throw new ForbiddenError({ message: "You don't account (admin) privileges" });
    }

    const { accountId } = content;
    const exists = await dal.account.findAccountById(accountId);

    if (exists === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else {
        const exists = await dal.user.existsByUsername(username, accountId);
        return c.json({ exists: exists !== null }, status.OK);
    }
};

// TODO: Throw forbidden error when requester (account) doesn't have access to user.
// Current this request is skipped as DB makes changes based on relationships which
// doesn't exists
export const deleteUser: IAMHandler["DeleteUser"] = async (c) => {
    const { userId } = c.req.valid("param");
    const content = c.get("accountJWTContent");

    if (content === undefined) {
        throw new ForbiddenError({ message: "You don't account (admin) privileges" });
    }

    const { accountId } = content;
    const exists = await dal.account.findAccountById(accountId);

    if (exists === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else {
        await dal.user.delete(userId, exists);
        log.info("User deleted");
        return c.body(null, status.NO_CONTENT);
    }
};

// TODO: Throw forbidden error when requester (account) doesn't have access to user.
// Current this request is skipped as DB makes changes based on relationships which
// doesn't exists
export const getUser: IAMHandler["GetUser"] = async (c) => {
    const { userId } = c.req.valid("param");
    const content = c.get("accountJWTContent");

    if (content === undefined) {
        throw new ForbiddenError({ message: "You don't account (admin) privileges" });
    }

    const { accountId } = content;
    const exists = await dal.account.findAccountById(accountId);

    if (exists === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else {
        const user = await dal.user.findById(userId, accountId);

        if (user === null) {
            throw new NotFoundError({ message: "User not found" });
        }

        return c.json({ user }, status.OK);
    }
};

export const getUsers: IAMHandler["GetUsers"] = async (c) => {
    const accountContent = c.get("accountJWTContent");
    const userContent = c.get("userJWTContent");

    if (!userContent && !accountContent) {
        throw new ForbiddenError({ message: "You don't account access" });
    }

    const { accountId } = userContent ?? accountContent!;
    const { limit, offset, search } = c.req.valid("query");

    const exists = await dal.account.findAccountById(accountId);

    if (exists === null) {
        throw new NotFoundError({ message: "Account doesn't exists" });
    } else {
        const { users, totalCount } = await dal.user.find(
            exists,
            search,
            limit,
            offset,
        );

        return c.json(
            {
                total: totalCount,
                users: await Promise.all(
                    users.map((u) => UserClientSchema.parseAsync(u)),
                ),
            },
            status.OK,
        );
    }
};

export const userLogin: IAMHandler["UserLogin"] = async (c) => {
    const body = c.req.valid("json");
    const info = await dal.user.findHashDetails(body.accountId, body.username);

    if (info === null) {
        throw new NotFoundError({ message: "User doesn't exists" });
    } else {
        const isRightPwd = await auth.verifyPwd(body.password, info.passwordHash);

        if (!isRightPwd) {
            throw new BadRequestError({ message: "Wrong password" });
        } else {
            const accessToken = auth.createAccessToken({
                type: "user",
                accountId: info.accountId,
                userId: info.userId,
            });
            const refreshToken = auth.createRefreshToken({
                type: "user",
                accountId: info.accountId,
                userId: info.userId,
            });

            c.get("session").set("refreshToken", refreshToken);

            await dal.user.setLastLogin(info.userId, info.accountId);

            return c.json({ accessToken }, status.OK);
        }
    }
};

export const myProfile: IAMHandler["MyProfile"] = async (c) => {
    const accountJWTcontent = c.get("accountJWTContent");
    const userJWTcontent = c.get("userJWTContent");

    if (accountJWTcontent) {
        const { accountId } = accountJWTcontent;
        const account = await dal.account.findById(accountId);

        if (account === null) {
            throw new NotFoundError({ message: "Account Not Found" });
        }

        return c.json({ roles: ["admin"] as const, account: account }, status.OK);
    }

    if (userJWTcontent) {
        const { accountId, userId } = userJWTcontent;
        const [user, account] = await Promise.all([
            dal.user.findById(userId, accountId),
            dal.account.findById(accountId),
        ]);

        if (account === null || user === null) {
            throw new NotFoundError({ message: "Account/User Not Found" });
        }

        return c.json({ roles: ["user"] as const, account, user }, status.OK);
    }

    throw new UnauthorizedError({ message: "Unauthorized" });
};

export const logout: IAMHandler["Logout"] = async (c) => {
    c.get("session").deleteSession();

    return c.body(null, status.NO_CONTENT);
};
