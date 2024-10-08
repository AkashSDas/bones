import { env } from "./env";

import argon2 from "argon2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";

const AccessTokenPayload = z.object({
    accountId: z.string().uuid(),
});

export type AccessTokenContent = z.infer<typeof AccessTokenPayload>;

class AuthUtil {
    private generateSalt(size: number = 16): Buffer {
        return crypto.randomBytes(size);
    }

    async hashPwd(pwd: string, saltSize: number = 16): Promise<[string, string]> {
        // There's no need to save this salt separately as argon save it in hash str
        const salt = this.generateSalt(saltSize);
        const hash = await argon2.hash(pwd, { type: argon2.argon2id, salt });

        return [hash, salt.toString("hex")];
    }

    async verifyPwd(pwd: string, hash: string): Promise<boolean> {
        return await argon2.verify(hash, pwd);
    }

    createToken(length: number = 16): string {
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString("hex")
            .slice(0, length);
    }

    hashToken(input: string): string {
        return crypto.createHash("sha256").update(input).digest("hex");
    }

    createAccessToken(payload: Record<string, unknown> = {}): string {
        return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
            expiresIn: env.ACCESS_TOKEN_AGE,
        });
    }

    createRefreshToken(payload: Record<string, unknown> = {}): string {
        return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
            expiresIn: env.REFRESH_TOKEN_AGE,
        });
    }

    async getAccessTokenContent(payload: unknown): Promise<AccessTokenContent | null> {
        const { success, data } = await AccessTokenPayload.safeParseAsync(payload);

        if (success) {
            return data;
        } else {
            return null;
        }
    }

    generateRandomPassword(
        length: number = 12,
        options: {
            includeUppercase?: boolean;
            includeNumbers?: boolean;
            includeSymbols?: boolean;
        } = {
            includeUppercase: true,
            includeNumbers: true,
            includeSymbols: true,
        },
    ): string {
        const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numberChars = "0123456789";
        const symbolChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        // Start with lowercase characters
        let allChars = lowercaseChars;

        // Add options based on input
        if (options.includeUppercase) allChars += uppercaseChars;
        if (options.includeNumbers) allChars += numberChars;
        if (options.includeSymbols) allChars += symbolChars;

        // Generate password
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars[randomIndex];
        }

        return password;
    }
}

export const auth = new AuthUtil();
