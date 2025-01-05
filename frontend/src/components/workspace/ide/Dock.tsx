import {
    DndContext,
    DragEndEvent,
    MouseSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ZapIcon, ZapOffIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/shared/Button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/shared/Tooltip";
import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { DOCK_ITEMS, DockItemKey, useWorkspaceDockStore } from "@/store/workspace-dock";
import { useWorkspaceTaskWindowStore } from "@/store/workspace-task-window";
import { cn } from "@/utils/styles";

export function Dock() {
    const { order, updateOrder, stopLayoutChange } = useWorkspaceDockStore();

    useEffect(function disallowLayoutChangeOnInitLoad() {
        stopLayoutChange();
        // @eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 },
        }),
    );

    const handleDragEnd = (evt: DragEndEvent) => {
        const { active, over } = evt;

        if (active && over && active.id !== over.id) {
            const oldIndex = order.indexOf(active.id as DockItemKey);
            const newIndex = order.indexOf(over.id as DockItemKey);

            const newOrder = arrayMove(order, oldIndex, newIndex);
            updateOrder(newOrder);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
                <Droppable />
            </SortableContext>
        </DndContext>
    );
}

function BridgeConnectionStatus() {
    const { connectionStatus } = useWorkspaceBridgeStore();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {connectionStatus === "connected" ? (
                    <ZapIcon size={18} className="text-brand-400 min-h-9" />
                ) : (
                    <ZapOffIcon size={18} className="text-grey-400" />
                )}
            </TooltipTrigger>

            <TooltipContent side="right">
                Bridge{" "}
                {`${connectionStatus[0].toUpperCase()}${connectionStatus.slice(1)}`}
            </TooltipContent>
        </Tooltip>
    );
}

function Droppable() {
    const { order, allowLayoutChange } = useWorkspaceDockStore();

    return (
        <TooltipProvider>
            <div className="flex flex-col items-center h-full min-h-full gap-12 pt-6 pb-16 overflow-y-auto border-r no-scrollbar w-14 border-r-grey-900">
                <BridgeConnectionStatus />

                {order.map((item) => {
                    const { icon: Icon, label } = DOCK_ITEMS[item];

                    return (
                        <SortableItem
                            key={item}
                            id={item}
                            icon={<Icon isLock={!allowLayoutChange} />}
                            label={label}
                        />
                    );
                })}
            </div>
        </TooltipProvider>
    );
}

function SortableItem(props: {
    id: DockItemKey;
    icon: React.JSX.Element;
    label: string;
}) {
    const { resetOrder, toggleAllowLayoutChange, allowLayoutChange } =
        useWorkspaceDockStore();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: props.id,
        disabled: !allowLayoutChange,
    });

    const { setContextWindow } = useWorkspaceStore();

    const { setShow, setActivePaneId } = useWorkspaceTaskWindowStore();

    function handleClick() {
        switch (props.id) {
            case "files": {
                setContextWindow("files");
                break;
            }
            case "fileSearch": {
                setContextWindow("fileSearch");
                break;
            }
            case "textSearch": {
                setContextWindow("textSearch");
                break;
            }
            case "lsp": {
                setContextWindow("lsp");
                break;
            }
            case "resetDock": {
                resetOrder();
                break;
            }
            case "lockLayout": {
                toggleAllowLayoutChange();
                break;
            }
            case "terminal": {
                setActivePaneId("terminalSessions");
                setShow(true);
                break;
            }
        }
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    ref={setNodeRef}
                    {...listeners}
                    {...attributes}
                    style={{
                        transform: CSS.Translate.toString(transform),
                        transition,
                    }}
                    className={cn(
                        allowLayoutChange ? "border border-info-500 border-dashed" : "",
                        "min-h-9",
                    )}
                    onClick={handleClick}
                >
                    {props.icon}
                </Button>
            </TooltipTrigger>

            <TooltipContent side="right">
                <p>{props.label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
