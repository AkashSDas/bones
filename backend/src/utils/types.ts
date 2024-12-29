import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { type Context } from "hono";
import { type Session } from "hono-sessions";

import { type AccountClient } from "@/db/models/account";
import { type UserClient } from "@/db/models/user";
import { type TokenPayload } from "@/schemas/auth";

type HonoVariables = {
    correlationId?: string;
    accountJWTContent?: Extract<TokenPayload, { type: "account" }>;
    userJWTContent?: Extract<TokenPayload, { type: "user" }>;

    account?: AccountClient | null;
    accountPk?: number | null;

    user?: UserClient | null;
    userPk?: number | null;

    isAdmin?: boolean | null;

    // HonoSessions pkg related types
    session: Session<{ refreshToken: string }>;
    session_key_rotation: boolean;
};

export type AppBindings = { Variables: HonoVariables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type HonoContext = Context<AppBindings, string, {}>;
