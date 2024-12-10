import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useDebounceCallback } from "usehooks-ts";

import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceFileTreeStore } from "@/store/workspace-file-tree";
import {
    CreateFileOrFolderResponseSchema,
    DeleteFilesOrFoldersResponseSchema,
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
    const {
        setFileTree,
        setIsFetching,
        isFetching,
        isCreatingFileOrFolder,
        setIsCreatingFileOrFolder,
        setAddFileOrFolderInDirectory,
        setIsDeletingFilesOrFolders,
        isDeletingFilesOrFolders,
    } = useWorkspaceFileTreeStore();

    const wasDisconnected = useRef(true);

    // ==========================================
    // Send request
    // ==========================================

    const getFileTree = useCallback(
        function () {
            if (bridgeWsURL && bridgeSocket && !isFetching) {
                setIsFetching(true);
                bridgeSocket.send(JSON.stringify(fileTreeManger.listFileTreeRequest()));
            }
        },
        [bridgeWsURL, bridgeSocket, isFetching, setIsFetching],
    );

    const createFileOrFolder = useCallback(
        function (name: string, absolutePath: string, isDirectory: boolean) {
            if (
                bridgeSocket &&
                bridgeWsURL &&
                !isFetching &&
                !isCreatingFileOrFolder &&
                !isDeletingFilesOrFolders
            ) {
                setIsCreatingFileOrFolder(true);
                bridgeSocket.send(
                    JSON.stringify(
                        fileTreeManger.createFileOrFolderRequest(
                            name,
                            absolutePath,
                            isDirectory,
                        ),
                    ),
                );
            }
        },
        [
            bridgeWsURL,
            bridgeSocket,
            isFetching,
            isCreatingFileOrFolder,
            isDeletingFilesOrFolders,
            setIsCreatingFileOrFolder,
        ],
    );

    const deleteFilesOrFolders = useCallback(
        function (absolutePaths: string[]) {
            if (bridgeSocket && bridgeWsURL && !isFetching && !isCreatingFileOrFolder) {
                setIsDeletingFilesOrFolders(true);
                bridgeSocket.send(
                    JSON.stringify(
                        fileTreeManger.deleteFilesOrFoldersRequest(absolutePaths),
                    ),
                );
            }
        },
        [
            bridgeWsURL,
            bridgeSocket,
            isFetching,
            isCreatingFileOrFolder,
            setIsCreatingFileOrFolder,
        ],
    );

    // ==========================================
    // Handlers
    // ==========================================

    const handleGetFileTreeResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = ListFileTreeResponseSchema.parse(data);

            if (parsed?.success) {
                setFileTree(parsed.fileTree);
            }

            setIsFetching(false);

            setIsCreatingFileOrFolder(false);
            setAddFileOrFolderInDirectory(null);

            setIsDeletingFilesOrFolders(false);
        },
        [setIsFetching, setFileTree],
    );

    const handleCreateFileOrFolderResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = CreateFileOrFolderResponseSchema.parse(data);

            if (parsed?.success && bridgeSocket) {
                // TODO: not working and there using useEffect duckTapeLoadFileTreeOnAddingFileOrFolder
                getFileTree();
            } else {
                setIsCreatingFileOrFolder(false);
                setAddFileOrFolderInDirectory(null);
            }
        },
        [
            getFileTree,
            setIsCreatingFileOrFolder,
            bridgeSocket,
            setAddFileOrFolderInDirectory,
        ],
    );

    const handleDeleteFilesOrFoldersResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = DeleteFilesOrFoldersResponseSchema.parse(data);

            if (parsed?.success && bridgeSocket) {
                // TODO: not working and there using useEffect duckTapeLoadFileTreeOnAddingFileOrFolder
                getFileTree();
            } else {
                setIsDeletingFilesOrFolders(false);
            }
        },
        [
            getFileTree,
            setIsCreatingFileOrFolder,
            bridgeSocket,
            setAddFileOrFolderInDirectory,
        ],
    );

    const mapRequestToHandler = useCallback(
        function (data: Record<string, unknown>) {
            const { data: event } = FileTreeEventSchema.safeParse(data.event);

            switch (event) {
                case "list":
                    handleGetFileTreeResponse(data);
                    break;
                case "create":
                    handleCreateFileOrFolderResponse(data);
                    break;
                case "delete":
                    handleDeleteFilesOrFoldersResponse(data);
                    break;
            }
        },
        [
            handleGetFileTreeResponse,
            handleCreateFileOrFolderResponse,
            handleDeleteFilesOrFoldersResponse,
        ],
    );

    useEffect(
        function syncStatus() {
            if (
                wasDisconnected.current &&
                connectionStatus === "connected" &&
                opts?.implicitlyGetFileTree &&
                !isCreatingFileOrFolder
            ) {
                wasDisconnected.current = false;
                getFileTree();
            }
        },
        [connectionStatus, getFileTree, isCreatingFileOrFolder],
    );

    useEffect(
        function duckTapeLoadFileTreeOnAddingFileOrFolder() {
            if (
                !wasDisconnected.current &&
                (!isCreatingFileOrFolder || !isDeletingFilesOrFolders)
            ) {
                getFileTree();
            }
        },
        [isCreatingFileOrFolder, isDeletingFilesOrFolders],
    );

    return {
        getFileTree,
        createFileOrFolder,
        deleteFilesOrFolders,
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
