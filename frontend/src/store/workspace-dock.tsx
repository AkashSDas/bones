import {
    FileSearchIcon,
    FilesIcon,
    LockIcon,
    LockOpenIcon,
    RotateCcwIcon,
    RouterIcon,
    Terminal,
    TextSearchIcon,
    Tv2Icon,
} from "lucide-react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type DockItem<T = unknown> = {
    icon: (props: T) => React.JSX.Element;
    label: string;
};

export type DockItemKey =
    | "files"
    | "textSearch"
    | "fileSearch"
    | "terminal"
    | "webview"
    | "networking"
    | "lockLayout"
    | "resetDock";

export const DOCK_ITEMS: Record<DockItemKey, DockItem | DockItem<{ isLock: boolean }>> =
    {
        files: {
            icon: function () {
                return <FilesIcon />;
            },
            label: "Files",
        },
        textSearch: {
            icon: function () {
                return <TextSearchIcon />;
            },
            label: "Text Search",
        },
        fileSearch: {
            icon: function () {
                return <FileSearchIcon />;
            },
            label: "File Search",
        },
        terminal: {
            icon: function () {
                return <Terminal />;
            },
            label: "Terminal",
        },
        webview: {
            icon: function () {
                return <Tv2Icon />;
            },
            label: "Web View",
        },
        networking: {
            icon: function () {
                return <RouterIcon />;
            },
            label: "Networking",
        },
        lockLayout: {
            icon: function (props: { isLock: boolean }) {
                if (props.isLock) {
                    return <LockIcon />;
                } else {
                    return <LockOpenIcon />;
                }
            },
            label: "Lock Layout",
        },
        resetDock: {
            icon: function () {
                return <RotateCcwIcon />;
            },
            label: "Reset Dock",
        },
    };

const INITIAL_ORDER: DockItemKey[] = [
    "files",
    "textSearch",
    "fileSearch",
    "terminal",
    "webview",
    "networking",
    "lockLayout",
    "resetDock",
];

type WorkspaceDockState = {
    allowLayoutChange: boolean;
    toggleAllowLayoutChange: () => void;
    stopLayoutChange: () => void;

    order: DockItemKey[];
    updateOrder: (newOrder: DockItemKey[]) => void;
    resetOrder: () => void;
};

export const useWorkspaceDockStore = create<WorkspaceDockState>()(
    devtools(
        persist(
            function (set) {
                return {
                    allowLayoutChange: true,
                    toggleAllowLayoutChange() {
                        set((state) => ({
                            allowLayoutChange: !state.allowLayoutChange,
                        }));
                    },
                    stopLayoutChange() {
                        set((_state) => ({ allowLayoutChange: false }));
                    },

                    order: INITIAL_ORDER,
                    updateOrder(newOrder) {
                        set((_state) => ({ order: newOrder }));
                    },
                    resetOrder() {
                        set((_state) => ({ order: INITIAL_ORDER }));
                    },
                };
            },
            { name: "workspace-dock-store" },
        ),
    ),
);
