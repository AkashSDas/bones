import { Columns2Icon, XIcon } from "lucide-react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import { Button } from "@/components/shared/Button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/shared/Tooltip";
import { useWorkspacePane } from "@/hooks/workspace-pane";
import { type PaneId, type PaneTab, useWorkspaceStore } from "@/store/workspace";
import { cn } from "@/utils/styles";

import { FileIcon } from "./FileIcon";

export function MainSection() {
    const { panes, setPanesTree, panesTree } = useWorkspaceStore();
    const { addPane, removePane } = useWorkspacePane();

    return (
        <TooltipProvider>
            <Mosaic<PaneId>
                value={panesTree}
                onChange={setPanesTree}
                zeroStateView={<div></div>}
                renderTile={(id, path) => (
                    <MosaicWindow<PaneId>
                        path={path}
                        renderToolbar={function (_props, _draggable) {
                            const pane = panes[id];

                            return (
                                <div className="flex items-center justify-between w-full h-full gap-1 px-2 border-b bg-grey-900 hover:bg-grey-900 border-b-grey-800">
                                    <span className="flex items-center overflow-x-auto no-scrollbar">
                                        {pane.orderedTabIds.map((tabId) => {
                                            const tab = pane.tabs[tabId];

                                            return (
                                                <TabButton
                                                    key={tab.tabId}
                                                    tab={tab}
                                                    isActive={
                                                        pane.activeTab === tab.tabId
                                                    }
                                                    paneId={id}
                                                />
                                            );
                                        })}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="!h-7 !w-7 shadow-none"
                                                    onClick={() => addPane()}
                                                >
                                                    <Columns2Icon className="!w-4 !h-4" />
                                                </Button>
                                            </TooltipTrigger>

                                            <TooltipContent side="bottom">
                                                <p>Split</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="!h-7 !w-7 shadow-none"
                                                    onClick={() => removePane(id)}
                                                >
                                                    <XIcon className="!w-4 !h-4" />
                                                </Button>
                                            </TooltipTrigger>

                                            <TooltipContent side="bottom">
                                                <p>Delete</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </span>
                                </div>
                            );
                        }}
                        title={panes[id].paneId}
                    >
                        Hello
                    </MosaicWindow>
                )}
                initialValue={null}
            />
        </TooltipProvider>
    );
}

function TabButton(props: { tab: PaneTab; isActive: boolean; paneId: PaneId }) {
    const { removeTab } = useWorkspacePane();
    const { setActiveTab, setActivePaneId } = useWorkspaceStore();

    if (props.tab.type === "codeFile") {
        return (
            <span
                className={cn(
                    "flex items-center gap-2 px-2 text-sm text-grey-300 rounded-sm cursor-pointer",
                    props.isActive && "bg-grey-800",
                )}
                onClick={() => {
                    setActiveTab(props.paneId, props.tab.tabId);
                    setActivePaneId(props.paneId);
                }}
            >
                <FileIcon
                    filename={props.tab.file.name}
                    isFile
                    height={20}
                    width={20}
                />
                <span className="whitespace-nowrap text-nowrap">
                    {props.tab.file.name}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="!h-7 !w-7 !min-w-7 !px-0 shadow-none"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeTab(props.tab.tabId, props.paneId);
                    }}
                >
                    <XIcon className="!w-4 !h-4" />
                </Button>
            </span>
        );
    }

    return null;
}
