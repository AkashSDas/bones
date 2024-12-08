import * as ResizablePrimitive from "react-resizable-panels";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "@/utils/styles";

const ResizablePanelGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
    <ResizablePrimitive.PanelGroup
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className,
        )}
        {...props}
    />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
    withHandle,
    className,
    ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean;
}) => (
    <ResizablePrimitive.PanelResizeHandle
        className={cn(
            "relative flex w-px items-center justify-center border-grey-800 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
            className,
        )}
        {...props}
    >
        {withHandle && (
            <div className="z-10 flex items-center justify-center w-3 h-4 border rounded-sm bg-grey-900 border-grey-800">
                <GripVerticalIcon className="w-3 h-3 text-grey-400" />
            </div>
        )}
    </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
