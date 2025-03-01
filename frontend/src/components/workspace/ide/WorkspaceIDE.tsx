import { LogsIcon, TerminalIcon, XIcon } from "lucide-react";

import { Button } from "@/components/shared/Button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/shared/Resizable";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/shared/Tooltip";
import {
    useWorkspaceBridgeConnection,
    useWorkspaceBridgeV2Connection,
} from "@/hooks/workspace";
import { useWorkspaceStore } from "@/store/workspace";
import {
    type TaskWindowPane,
    useWorkspaceTaskWindowStore,
} from "@/store/workspace-task-window";
import { cn } from "@/utils/styles";

import { Dock } from "./Dock";
import { FileTree } from "./FileTree";
import { LSPExtensions } from "./LSPExtensions";
import { MainSection } from "./MainSection";
import { PortForwarding } from "./PortForwarding";
import { SearchFile } from "./SearchFile";
import { SearchTextInFile } from "./SearchTextInFile";
import { TaskWindowPane as TaskWindow } from "./TaskWindowPane";

const ICON_MAPPING: Record<TaskWindowPane["id"], React.JSX.Element> = {
    terminalSessions: <TerminalIcon size={16} />,
};

export function WorkspaceIDE() {
    useWorkspaceBridgeConnection();
    useWorkspaceBridgeV2Connection();

    const contextWindow = useWorkspaceStore((s) => s.contextWindow);
    const { panes, activePaneId, setActivePaneId, setShow, show } =
        useWorkspaceTaskWindowStore();

    return (
        <section className="w-full flex h-[calc(100vh-48px)] md:h-[calc(100vh-56px)] overflow-hidden">
            <Dock />

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    order={1}
                    defaultSize={25}
                    minSize={contextWindow ? 10 : 0}
                    maxSize={75}
                >
                    <FileTree />
                    <LSPExtensions />
                    <SearchFile />
                    <SearchTextInFile />
                    <PortForwarding />
                </ResizablePanel>

                {contextWindow && <ResizableHandle withHandle />}

                <ResizablePanel
                    order={contextWindow ? 2 : 1}
                    minSize={contextWindow ? 25 : 100}
                >
                    <div className="relative w-full h-full">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="absolute bottom-0 right-0 z-10 w-full"
                        >
                            <ResizablePanel order={1} minSize={25} defaultSize={50}>
                                <MainSection />
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            <ResizablePanel
                                order={2}
                                defaultSize={50}
                                minSize={25}
                                maxSize={show ? 75 : 0}
                                className="bg-grey-950"
                            >
                                <div className="flex items-center justify-between gap-1 px-2 py-1 overflow-x-auto bg-grey-900 no-scrollbar">
                                    <span className="flex items-center overflow-x-auto no-scrollbar">
                                        {panes.map((pane) => {
                                            return (
                                                <button
                                                    key={pane.id}
                                                    onClick={() =>
                                                        setActivePaneId(pane.id)
                                                    }
                                                    className={cn(
                                                        "text-sm text-grey-300 h-7",
                                                        "flex items-center gap-2 px-2 rounded-sm cursor-pointer",
                                                        pane.id === activePaneId &&
                                                            "bg-grey-800",
                                                    )}
                                                >
                                                    {ICON_MAPPING[pane.id]}
                                                    {pane.label}
                                                </button>
                                            );
                                        })}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="!h-7 !w-7 shadow-none"
                                                        onClick={() => setShow(false)}
                                                    >
                                                        <XIcon className="!w-4 !h-4" />
                                                    </Button>
                                                </TooltipTrigger>

                                                <TooltipContent side="bottom">
                                                    <p>Close</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </span>
                                </div>

                                <TaskWindow />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </section>
    );
}
