import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";

import { TokenPayload } from "@/schemas/auth";

type HonoVariables = {
    correlationId?: string;
    accountJWTContent?: Extract<TokenPayload, { type: "account" }>;
    userJWTContent?: Extract<TokenPayload, { type: "user" }>;
};

export type AppBindings = { Variables: HonoVariables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
