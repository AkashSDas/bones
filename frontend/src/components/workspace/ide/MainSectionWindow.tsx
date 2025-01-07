import { useMemo } from "react";

import { useWorkspaceStore } from "@/store/workspace";

import { IdeEditor } from "./IdeEditor";
import { WebView } from "./WebView";

export function MainSectionWindow(props: { paneId: string }) {
    const { panes } = useWorkspaceStore();

    const activeTab = useMemo(
        function () {
            const activeTabId = panes[props.paneId]?.activeTab;

            if (activeTabId) {
                return panes[props.paneId].tabs[activeTabId] ?? null;
            }

            return null;
        },
        [panes, panes[props.paneId]?.activeTab],
    );

    if (activeTab === null) {
        return null;
    }

    if (activeTab.type === "codeFile") {
        return <IdeEditor file={activeTab.file} paneId={props.paneId} />;
    } else if (activeTab.type === "webView") {
        return <WebView />;
    }

    return null;
}
