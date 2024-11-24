import { z } from "zod";

import { IAMPolicies } from "./iam";
import { WorkspacePolicies } from "./workspace";

export const IAMPolicySchemas = {
    IAM: IAMPolicies,
    Workspace: WorkspacePolicies,
};

export type IAMPolicy = {
    IAMService: z.infer<typeof IAMPolicySchemas.IAM.IAMService>;
    Workspace: z.infer<typeof WorkspacePolicies.Workspace>;
    WorkspaceService: z.infer<typeof WorkspacePolicies.WorkspaceService>;
};
