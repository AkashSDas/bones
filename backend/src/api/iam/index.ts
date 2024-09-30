import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "@/utils/types";

import * as handlers from "./iam.handlers";
import * as routes from "./iam.routes";

const app = new OpenAPIHono<AppBindings>();

const router = app.openapi(routes.accountSignup, handlers.accountSignup);

export { router as iamRouter };
