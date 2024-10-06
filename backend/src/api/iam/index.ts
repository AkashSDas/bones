import { createHonoApp } from "@/utils/app";

import * as handlers from "./iam.handlers";
import * as routes from "./iam.routes";

const app = createHonoApp();

const router = app
    .openapi(routes.accountSignup, handlers.accountSignup)
    .openapi(routes.activateAccount, handlers.activateAccount)
    .openapi(routes.accountExists, handlers.accountExists)
    .openapi(routes.accountLogin, handlers.accountLogin)
    .openapi(routes.resetPassword, handlers.resetPassword)
    .openapi(routes.completeResetPassword, handlers.completeResetPassword);

export { router as iamRouter };
