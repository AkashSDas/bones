import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/shared/Resizable";
import { useWorkspaceBridgeConnection } from "@/hooks/workspace";
import { useWorkspaceStore } from "@/store/workspace";

import { Dock } from "./Dock";
import { FileTree } from "./FileTree";
import { MainSection } from "./MainSection";

export function WorkspaceIDE() {
    useWorkspaceBridgeConnection();
    const contextWindow = useWorkspaceStore((s) => s.contextWindow);

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
                </ResizablePanel>

                {contextWindow && <ResizableHandle withHandle />}

                <ResizablePanel
                    order={contextWindow ? 2 : 1}
                    minSize={contextWindow ? 25 : 100}
                >
                    <div className="w-full h-full">
                        <MainSection />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </section>
    );
}
