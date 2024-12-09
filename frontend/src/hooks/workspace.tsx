import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useDebounceCallback } from "usehooks-ts";

import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceFileTreeStore } from "@/store/workspace-file-tree";
import {
    FileTreeEventSchema,
    ListFileTreeResponseSchema,
    fileTreeManger,
} from "@/utils/workspace-file-tree";

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

export function useWorkspaceFileTree(opts?: { implicitlyGetFileTree?: boolean }) {
    const { bridgeWsURL } = useWorkspaceURL();
    const { bridgeSocket, connectionStatus } = useWorkspaceBridgeStore();
    const { setFileTree, setIsFetching, isFetching } = useWorkspaceFileTreeStore();

    const wasDisconnected = useRef(true);

    // ==========================================
    // Send request
    // ==========================================

    const getFileTree = useCallback(
        function () {
            if (bridgeSocket && bridgeWsURL && !isFetching) {
                setIsFetching(true);
                bridgeSocket.send(JSON.stringify(fileTreeManger.listFileTreeRequest()));
            }
        },
        [bridgeWsURL, bridgeSocket, isFetching, setIsFetching],
    );

    // ==========================================
    // Handlers
    // ==========================================

    const mapRequestToHandler = useCallback(function (data: Record<string, unknown>) {
        const { data: event } = FileTreeEventSchema.safeParse(data.event);

        switch (event) {
            case "list":
                handleGetFileTreeResponse(data);
        }
    }, []);

    const handleGetFileTreeResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = ListFileTreeResponseSchema.parse(data);

            if (parsed?.success) {
                setFileTree(parsed.fileTree);
            }

            setIsFetching(false);
        },
        [setIsFetching, setFileTree],
    );

    useEffect(
        function syncStatus() {
            if (
                wasDisconnected.current &&
                connectionStatus === "connected" &&
                opts?.implicitlyGetFileTree
            ) {
                wasDisconnected.current = false;
                getFileTree();
            }
        },
        [connectionStatus, getFileTree],
    );

    return {
        getFileTree,
        mapRequestToHandler,
    };
}

/** Handle the workspace bridge connection. Should be used in one place only */
export function useWorkspaceBridgeConnection() {
    const { bridgeWsURL } = useWorkspaceURL();

    const { setBridgeSocket, setConnectionStatus } = useWorkspaceBridgeStore();

    const { mapRequestToHandler } = useWorkspaceFileTree({
        implicitlyGetFileTree: true,
    });

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
            const parsed: Record<string, unknown> = JSON.parse(data);

            if (parsed.type && parsed.event) {
                switch (parsed.type) {
                    case "fs": {
                        mapRequestToHandler(parsed);
                    }
                }
            }
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
