import { z } from "zod";

import { IAMPolicies as _IAMPolicies } from "./iam";
import { WorkspacePolicies } from "./workspace";

export const IAMPolicies = {
    IAM: _IAMPolicies,
    Workspace: WorkspacePolicies,
};

export type IAMPolicy = {
    IAMService: z.infer<typeof IAMPolicies.IAM.IAMService>;
    Workspace: z.infer<typeof WorkspacePolicies.Workspace>;
    WorkspaceService: z.infer<typeof WorkspacePolicies.WorkspaceService>;
};
