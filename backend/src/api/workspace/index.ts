import { createHonoApp } from "@/utils/app";

import * as handlers from "./workspace.handlers";
import * as routes from "./workspace.routes";

const app = createHonoApp();

const router = app
    .openapi(routes.initializeWorkspace, handlers.initialize)
    .openapi(routes.deinitializeWorkspace, handlers.deinitialize)
    .openapi(routes.createWorkspace, handlers.createWorkspace)
    .openapi(routes.deleteWorkspace, handlers.deleteWorkspace);

export { router as workspaceRouter };

// Endpoints:
// 1. create a new workspace Kubernetes namespace (user will see a btn and click on
// initialize namespace and this will save the namespace info in the DB -- new table)
