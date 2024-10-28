import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { Session } from "hono-sessions";

import { TokenPayload } from "@/schemas/auth";

type HonoVariables = {
    correlationId?: string;
    accountJWTContent?: Extract<TokenPayload, { type: "account" }>;
    userJWTContent?: Extract<TokenPayload, { type: "user" }>;

    // HonoSessions pkg related types
    session: Session<{ refreshToken: string }>;
    session_key_rotation: boolean;
};

export type AppBindings = { Variables: HonoVariables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
