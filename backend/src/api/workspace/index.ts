import { createHonoApp } from "@/utils/app";

import * as handlers from "./workspace.handlers";
import * as routes from "./workspace.routes";

const app = createHonoApp();

const router = app
    .openapi(routes.initializeWorkspace, handlers.initialize)
    .openapi(routes.deinitializeWorkspace, handlers.deinitialize)
    .openapi(routes.createWorkspace, handlers.createWorkspace)
    .openapi(routes.deleteWorkspace, handlers.deleteWorkspace)
    .openapi(routes.getWorkspaces, handlers.getWorkspaces)
    .openapi(routes.updateWorkspace, handlers.updateWorkspace)
    .openapi(routes.getWorkspace, handlers.getWorkspace);

export { router as workspaceRouter };
