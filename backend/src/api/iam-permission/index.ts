import { createHonoApp } from "@/utils/app";

import * as handlers from "./iam-permission.handlers";
import * as routes from "./iam-permission.routes";

const app = createHonoApp();

const router = app
    .openapi(routes.getIAMPermissions, handlers.getIAMPermissions)
    .openapi(routes.updateIAMPermission, handlers.updateIAMPermission)
    .openapi(routes.getIAMPermission, handlers.getIAMPermission);

export { router as iamPermissionRouter };
