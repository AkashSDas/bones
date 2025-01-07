import { useWorkspaceTaskWindowStore } from "@/store/workspace-task-window";
import { cn } from "@/utils/styles";

import { TerminalPane } from "./TerminalPane";

export function TaskWindowPane() {
    const { activePaneId } = useWorkspaceTaskWindowStore();

    return (
        <div className="relative w-full h-full">
            <div
                className={cn(
                    activePaneId === "browserConsole"
                        ? "absolute w-full h-full opacity-100 visible"
                        : "absolute w-full h-full opacity-0 invisible",
                )}
            >
                <div>Browser Console</div>
            </div>

            <div
                className={cn(
                    activePaneId === "terminalSessions"
                        ? "absolute w-full h-full opacity-100 visible"
                        : "absolute w-full h-full opacity-0 invisible",
                    "mb-3",
                )}
            >
                <TerminalPane />
            </div>
        </div>
    );
}
