import { useCallback, useEffect, useMemo, useRef } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useDebounceCallback } from "usehooks-ts";

import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { fileTreeManger } from "@/utils/workspace-file-tree";

/** Derives workspace URL from current workspace state */
export function useWorkspaceURL(): {
    baseURL: string | null;
    bridgeURL: string | null;
    bridgeWsURL: string | null;
} {
    const workspaceId = useWorkspaceStore((s) => s.workspace?.workspaceId);

    const host = useMemo(
        () => (workspaceId ? `${workspaceId}-workspace.bones.test` : null),
        [workspaceId],
    );

    const baseURL = useMemo(() => (host ? `http://${host}` : null), [host]);
    const bridgeURL = useMemo(() => (host ? `http://${host}/_bridge` : null), [host]);
    const bridgeWsURL = useMemo(
        () => (host ? `ws://${host}/_bridge/ws` : null),
        [host],
    );

    return {
        baseURL,
        bridgeURL,
        bridgeWsURL,
    };
}

export function useWorkspaceFileTree() {
    const { bridgeWsURL } = useWorkspaceURL();
    const { bridgeSocket, connectionStatus } = useWorkspaceBridgeStore();

    const wasDisconnected = useRef(true);

    const getFileTree = useCallback(
        function () {
            if (bridgeSocket && bridgeWsURL) {
                bridgeSocket.send(JSON.stringify(fileTreeManger.listFileTree()));
            }
        },
        [bridgeWsURL, bridgeSocket],
    );

    const handleGetFileTreeResponse = useCallback(function (_evt: MessageEvent) {}, []);

    useEffect(
        function syncStatus() {
            if (wasDisconnected.current && connectionStatus === "connected") {
                wasDisconnected.current = false;
                getFileTree();
            }
        },
        [connectionStatus, getFileTree],
    );

    const getFileTreeDebounced = useDebounceCallback(getFileTree, 300);

    return {
        getFileTree: getFileTreeDebounced,
        handleGetFileTreeResponse,
    };
}

/** Handle the workspace bridge connection */
export function useWorkspaceBridgeConnection() {
    const { bridgeWsURL } = useWorkspaceURL();

    const { setBridgeSocket, setConnectionStatus } = useWorkspaceBridgeStore();

    const handleOpen = useCallback(
        function handleBridgeOpen() {
            setConnectionStatus("connected");
        },
        [setConnectionStatus],
    );

    const handleClose = useCallback(
        function handleBridgeClose() {
            setConnectionStatus("disconnected");
        },
        [setConnectionStatus],
    );

    const handleMessage = useCallback(function handleBridgeMessage(evt: MessageEvent) {
        console.log("Bridge connection message", { evt });

        try {
            const { data } = evt;
            const _parsed = JSON.parse(data.toString());

            // switch (parsed.type) {
            //     case "fs": {
            //     }
            // }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(
        function setupBridgeConnection() {
            if (bridgeWsURL) {
                const newSocket = new ReconnectingWebSocket(bridgeWsURL, [], {
                    maxRetries: 10,
                });

                newSocket.onopen = handleOpen;
                newSocket.onclose = handleClose;
                newSocket.onmessage = handleMessage;

                setBridgeSocket(newSocket);

                return function cleanup() {
                    newSocket.onopen = null;
                    newSocket.onclose = null;
                    newSocket.onmessage = null;
                    newSocket.close();
                };
            }
        },
        [bridgeWsURL, setBridgeSocket, handleClose, handleMessage, handleOpen],
    );
}
