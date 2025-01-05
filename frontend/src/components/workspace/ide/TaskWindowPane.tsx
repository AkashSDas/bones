import { useWorkspaceTaskWindowStore } from "@/store/workspace-task-window";

import { TerminalPane } from "./TerminalPane";

export function TaskWindowPane() {
    const { activePaneId } = useWorkspaceTaskWindowStore();

    switch (activePaneId) {
        case "browserConsole": {
            return <div>Browser Console</div>;
        }
        case "terminalSessions": {
            return <TerminalPane />;
        }
        default:
            return null;
    }
}
