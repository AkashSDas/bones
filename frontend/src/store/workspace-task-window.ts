import { create } from "zustand";

export type TaskWindowPane = {
    id: "browserConsole" | "terminalSessions";
    label: string;
};

type WorkspaceTaskWindow = {
    panes: TaskWindowPane[];
    activePaneId: TaskWindowPane["id"];
    setActivePaneId: (id: TaskWindowPane["id"]) => void;

    show: boolean;
    setShow: (show: boolean) => void;
};

export const useWorkspaceTaskWindowStore = create<WorkspaceTaskWindow>()(
    function (set) {
        return {
            panes: [
                { id: "terminalSessions", label: "Terminal Sessions" },
                { id: "browserConsole", label: "Browser Console" },
            ],
            activePaneId: "terminalSessions",
            setActivePaneId(id) {
                set({ activePaneId: id });
            },

            show: true,
            setShow(show) {
                set({ show });
            },
        };
    },
);
