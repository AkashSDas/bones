import { z } from "zod";

/** JWT content for account login */
const AccountTokenPayloadSchema = z.object({
    type: z.literal("account"),
    accountId: z.string().uuid(),
});

/** JWT content for user login */
const UserTokenPayloadSchema = z.object({
    type: z.literal("user"),
    accountId: z.string().uuid(),
    userId: z.string().uuid(),
});

/** JWT content payload for user/account login */
export const TokenPayloadSchema = z.union([
    AccountTokenPayloadSchema,
    UserTokenPayloadSchema,
]);

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
