import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { type GetApiV1WorkspaceWorkspaceId200Workspace } from "@/gen/schemas";

type ContextWindow = "files" | "textSearch" | "fileSearch" | "networking" | null;

type WorkspaceState = {
    workspace: GetApiV1WorkspaceWorkspaceId200Workspace | null;
    setWorkspace: (v: GetApiV1WorkspaceWorkspaceId200Workspace) => void;

    contextWindow: ContextWindow;
    setContextWindow: (v: ContextWindow) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
    devtools(function (set) {
        return {
            workspace: null,
            setWorkspace(v) {
                set((_state) => ({ workspace: v }));
            },

            contextWindow: "files",
            setContextWindow(v) {
                set((state) => {
                    if (state.contextWindow === v) {
                        return { contextWindow: null };
                    } else {
                        return { contextWindow: v };
                    }
                });
            },
        };
    }),
);
