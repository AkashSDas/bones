import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { Session } from "hono-sessions";

import { AccountClient } from "@/db/models/account";
import { TokenPayload } from "@/schemas/auth";

type HonoVariables = {
    correlationId?: string;
    accountJWTContent?: Extract<TokenPayload, { type: "account" }>;
    userJWTContent?: Extract<TokenPayload, { type: "user" }>;

    account?: AccountClient | null;

    // HonoSessions pkg related types
    session: Session<{ refreshToken: string }>;
    session_key_rotation: boolean;
};

export type AppBindings = { Variables: HonoVariables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
