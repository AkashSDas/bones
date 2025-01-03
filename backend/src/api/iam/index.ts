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
    .openapi(routes.completeResetPassword, handlers.completeResetPassword)
    .openapi(routes.refreshAccessToken, handlers.refreshAccessToken)
    .openapi(routes.createUser, handlers.createUser)
    .openapi(routes.updateUser, handlers.updateUser)
    .openapi(routes.userExists, handlers.userExists)
    .openapi(routes.deleteUser, handlers.deleteUser)
    .openapi(routes.getUser, handlers.getUser)
    .openapi(routes.getUsers, handlers.getUsers)
    .openapi(routes.userLogin, handlers.userLogin)
    .openapi(routes.myProfile, handlers.myProfile)
    .openapi(routes.logout, handlers.logout);

export { router as iamRouter };
