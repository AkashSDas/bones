import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";

type HonoVariables = {
    correlationId?: string;
};

export type AppBindings = { Variables: HonoVariables };

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
    R,
    AppBindings
>;
