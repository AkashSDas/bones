import { nanoid } from "nanoid";
import { useCallback } from "react";
import { MosaicNode } from "react-mosaic-component";

import {
    type PaneId,
    type PaneInfo,
    type PaneTab,
    type PaneTabPayload,
    type TabId,
    useWorkspaceStore,
} from "@/store/workspace";

export function useWorkspacePane() {
    const {
        panes,
        setPanes,
        setPanesTree,
        panesTree,
        activePaneId,
        setActivePaneId,
        setActiveTab,
    } = useWorkspaceStore();

    const addPaneToPanesTree = useCallback(
        function (pane: PaneInfo) {
            if (panesTree) {
                setPanesTree({
                    direction: "row",
                    first: panesTree,
                    second: pane.paneId,
                });
            } else {
                setPanesTree(pane.paneId);
            }
        },
        [panes, setPanes, panesTree],
    );

    const addPane = useCallback(
        function (tabs?: Record<TabId, PaneTab>): string {
            const paneId = nanoid();
            const pane: PaneInfo = {
                paneId,
                tabs: tabs ?? {},
                activeTab: tabs ? Object.keys(tabs)[0] : null,
                orderedTabIds: tabs ? Object.keys(tabs) : [],
            };

            setPanes({ ...panes, [paneId]: pane });
            addPaneToPanesTree(pane);
            setActivePaneId(paneId);

            return paneId;
        },
        [panes, setPanes, addPaneToPanesTree, setActivePaneId],
    );

    const checkTabExistsInPane = useCallback(
        function (payload: PaneTabPayload, paneId: PaneId): PaneTab | null {
            if (panes[paneId]) {
                if (payload.type === "codeFile") {
                    const tab = Object.values(panes[paneId].tabs).find(
                        (tab) => tab.file.name === payload.file.name,
                    );

                    if (tab) {
                        return tab;
                    }
                }
            }

            return null;
        },
        [panes],
    );

    const addTab = useCallback(
        function (payload: PaneTabPayload, paneId?: string) {
            const tabId = nanoid();

            if (paneId && panes[paneId]) {
                const exists = checkTabExistsInPane(payload, paneId);

                if (!exists) {
                    panes[paneId] = {
                        paneId,
                        tabs: {
                            ...panes[paneId].tabs,
                            [tabId]: { tabId, ...payload },
                        },
                        activeTab: tabId,
                        orderedTabIds: [...panes[paneId].orderedTabIds, tabId],
                    };
                } else {
                    setActiveTab(paneId, exists.tabId);
                }

                setActivePaneId(paneId);
            } else if (activePaneId) {
                const exists = checkTabExistsInPane(payload, activePaneId);

                if (!exists) {
                    panes[activePaneId] = {
                        paneId: activePaneId,
                        tabs: {
                            ...panes[activePaneId].tabs,
                            [tabId]: { tabId, ...payload },
                        },
                        activeTab: tabId,
                        orderedTabIds: [...panes[activePaneId].orderedTabIds, tabId],
                    };
                } else {
                    setActiveTab(activePaneId, exists.tabId);
                }
            } else if (Object.keys(panes).length > 0) {
                const paneId = Object.keys(panes)[0];
                const exists = checkTabExistsInPane(payload, paneId);

                if (!exists) {
                    panes[paneId] = {
                        paneId,
                        tabs: {
                            ...panes[paneId].tabs,
                            [tabId]: { tabId, ...payload },
                        },
                        activeTab: tabId,
                        orderedTabIds: [...panes[paneId].orderedTabIds, tabId],
                    };
                } else {
                    setActiveTab(paneId, exists.tabId);
                }

                setActivePaneId(paneId);
            } else {
                addPane({ [tabId]: { tabId, ...payload } });
            }
        },
        [panes, setPanes, addPane, activePaneId, setActivePaneId, checkTabExistsInPane],
    );

    const removePaneFromTree = useCallback(
        function (paneId: PaneId) {
            if (!panesTree) return;

            const removeFromNode = (
                node: MosaicNode<PaneId> | PaneId,
            ): MosaicNode<PaneId> | PaneId | null => {
                if (typeof node === "string") {
                    return node === paneId ? null : node;
                }

                if ("first" in node) {
                    const newFirst = removeFromNode(node.first);
                    const newSecond = removeFromNode(node.second);

                    if (newFirst === null) return newSecond;
                    if (newSecond === null) return newFirst;

                    return {
                        ...node,
                        first: newFirst,
                        second: newSecond,
                    };
                }

                return node;
            };

            const newTree = removeFromNode(panesTree);
            setPanesTree(newTree);
        },
        [panesTree, setPanesTree],
    );

    const removePane = useCallback(
        function (targetPaneId: PaneId) {
            const newPanes = { ...panes };

            delete newPanes[targetPaneId];
            setPanes(newPanes);

            removePaneFromTree(targetPaneId);

            if (activePaneId === targetPaneId) {
                setActivePaneId(
                    Object.keys(newPanes).length > 0 ? Object.keys(newPanes)[0] : null,
                );
            }
        },
        [panes, setPanes, removePaneFromTree, setActivePaneId, activePaneId],
    );

    const removeTab = useCallback(
        function (tabId: TabId, targetPaneId: PaneId) {
            const currentPane = panes[targetPaneId];

            if (!currentPane || !currentPane.tabs[tabId]) return;

            const updatedTabs = { ...currentPane.tabs };
            delete updatedTabs[tabId];

            const remainingTabIds = Object.keys(updatedTabs);

            if (remainingTabIds.length === 0) {
                removePane(targetPaneId);
            } else {
                // If there are remaining tabs, update the pane
                const newActiveTab = remainingTabIds[remainingTabIds.length - 1];

                setPanes({
                    ...panes,
                    [targetPaneId]: {
                        ...currentPane,
                        tabs: updatedTabs,
                        activeTab: newActiveTab,
                    },
                });
            }
        },
        [
            panes,
            setPanes,
            activePaneId,
            setActivePaneId,
            panesTree,
            setPanesTree,
            removePane,
        ],
    );

    return { addTab, addPane, removePane, removeTab };
}
