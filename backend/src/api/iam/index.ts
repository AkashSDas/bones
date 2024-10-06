import { createHonoApp } from "@/utils/app";

import * as handlers from "./iam.handlers";
import * as routes from "./iam.routes";

const app = createHonoApp();

const router = app
    .openapi(routes.accountSignup, handlers.accountSignup)
    .openapi(routes.activateAccount, handlers.activateAccount)
    .openapi(routes.accountExists, handlers.accountExists);

export { router as iamRouter };
