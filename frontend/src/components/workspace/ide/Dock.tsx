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
import { useEffect } from "react";

import { Button } from "@/components/shared/Button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/shared/Tooltip";
import { DOCK_ITEMS, DockItemKey, useWorkspaceDockStore } from "@/store/workspace-dock";

export function Dock() {
    const { order, updateOrder, stopLayoutChange } = useWorkspaceDockStore();

    useEffect(function disallowLayoutChangeOnInitLoad() {
        stopLayoutChange();
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
            // modifiers={[restrictToVerticalAxis]}
        >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
                <Droppable />
            </SortableContext>
        </DndContext>
    );
}

function Droppable() {
    const { order, allowLayoutChange } = useWorkspaceDockStore();

    return (
        <TooltipProvider>
            <div className="flex flex-col items-center h-full min-h-full gap-12 px-6 py-6 border-r w-14 border-r-grey-900 no-scrollbar">
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

    function handleClick() {
        switch (props.id) {
            case "resetDock": {
                resetOrder();
                break;
            }
            case "lockLayout": {
                toggleAllowLayoutChange();
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
                    className={
                        allowLayoutChange ? "border border-info-500 border-dashed" : ""
                    }
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