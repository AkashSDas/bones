import { z } from "zod";

import { WorkspacePolicies } from "./workspace";

export const IAMPolicies = {
    Workspace: WorkspacePolicies,
};

export type IAMPolicy = {
    Workspace: z.infer<typeof WorkspacePolicies.Workspace>;
    WorkspaceService: z.infer<typeof WorkspacePolicies.WorkspaceService>;
};
