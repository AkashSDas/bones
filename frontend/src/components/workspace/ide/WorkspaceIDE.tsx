import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/shared/Resizable";
import { useWorkspaceBridgeConnection } from "@/hooks/workspace";

import { Dock } from "./Dock";
import { FileTree } from "./FileTree";

export function WorkspaceIDE(props: { workspaceId: string }) {
    useWorkspaceBridgeConnection();

    return (
        <section className="w-full flex h-[calc(100vh-48px)] md:h-[calc(100vh-56px)] overflow-hidden">
            <Dock />

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel order={1} defaultSize={20} minSize={10} maxSize={80}>
                    <FileTree />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel order={2} minSize={20}>
                    <div className="w-full h-full">Editor</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </section>
    );
}
