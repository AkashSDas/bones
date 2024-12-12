import { MosaicNode } from "react-mosaic-component";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { type GetApiV1WorkspaceWorkspaceId200Workspace } from "@/gen/schemas";
import { type File } from "@/utils/workspace-file-tree";

type ContextWindow = "files" | "textSearch" | "fileSearch" | "networking" | null;

export type PaneId = string;
export type TabId = string;

export type FileTab = {
    type: "codeFile";
    file: File;
};

export type PaneTabPayload = FileTab;

export type PaneTab = {
    tabId: TabId;
} & PaneTabPayload;

export type PaneInfo = {
    paneId: PaneId;
    tabs: Record<TabId, PaneTab>;
    orderedTabIds: TabId[];
    activeTab: TabId | null;
};

export type PaneMap = Record<PaneId, PaneInfo>;

export type AbsolutePath = string;
export type FileContent = string;

type WorkspaceState = {
    workspace: GetApiV1WorkspaceWorkspaceId200Workspace | null;
    setWorkspace: (v: GetApiV1WorkspaceWorkspaceId200Workspace) => void;

    contextWindow: ContextWindow;
    setContextWindow: (v: ContextWindow) => void;

    panes: PaneMap;
    setPanes: (v: PaneMap) => void;
    panesTree: MosaicNode<PaneId> | null;
    setPanesTree: (v: MosaicNode<PaneId> | null) => void;
    activePaneId: PaneId | null;
    setActivePaneId: (v: PaneId | null) => void;
    setActiveTab: (paneId: PaneId, tabId: TabId) => void;

    loadingFiles: AbsolutePath[];
    addLoadingFile: (v: AbsolutePath) => void;
    removeLoadingFile: (v: AbsolutePath) => void;
    emptyLoadingFiles: () => void;
    files: Record<AbsolutePath, FileContent>;
    upsertFile: (v: { absolutePath: AbsolutePath; content: FileContent }) => void;
    deleteFile: (v: AbsolutePath) => void;
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

            panes: {},
            setPanes(v) {
                set((_state) => ({ panes: v }));
            },
            panesTree: null,
            setPanesTree(v) {
                set((_state) => ({ panesTree: v }));
            },
            activePaneId: null,
            setActivePaneId(v) {
                set((_state) => ({ activePaneId: v }));
            },
            setActiveTab(paneId: PaneId, tabId: TabId) {
                set((state) => {
                    if (state.panes[paneId]) {
                        return {
                            panes: {
                                ...state.panes,
                                [paneId]: {
                                    ...state.panes[paneId],
                                    activeTab: tabId,
                                },
                            },
                        };
                    } else {
                        return state;
                    }
                });
            },

            loadingFiles: [],
            addLoadingFile(v) {
                set((_state) => ({ loadingFiles: [..._state.loadingFiles, v] }));
            },
            removeLoadingFile(v) {
                set((state) => ({
                    loadingFiles: state.loadingFiles.filter((f) => f !== v),
                }));
            },
            emptyLoadingFiles() {
                set((_state) => ({ loadingFiles: [] }));
            },

            files: {},
            upsertFile(v) {
                set((_state) => ({
                    files: { ..._state.files, [v.absolutePath]: v.content },
                }));
            },
            deleteFile(v) {
                set((state) => {
                    const newFiles = { ...state.files };
                    delete newFiles[v];

                    return { files: newFiles };
                });
            },
        };
    }),
);
