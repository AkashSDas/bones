import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";

import { AccessTokenContent } from "./auth";

type HonoVariables = {
    correlationId?: string;
    jwtContent?: AccessTokenContent;
};

export type AppBindings = { Variables: HonoVariables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
