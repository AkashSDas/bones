import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { type GetApiV1WorkspaceWorkspaceId200Workspace } from "@/gen/schemas";

type WorkspaceState = {
    workspace: GetApiV1WorkspaceWorkspaceId200Workspace | null;
    setWorkspace: (v: GetApiV1WorkspaceWorkspaceId200Workspace) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
    devtools(function (set) {
        return {
            workspace: null,
            setWorkspace(v) {
                set((_state) => ({ workspace: v }));
            },
        };
    }),
);
