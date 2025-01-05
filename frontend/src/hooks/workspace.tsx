import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useMemo, useRef } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceFileTreeStore } from "@/store/workspace-file-tree";
import { useWorkspaceLSPStore } from "@/store/workspace-lsp";
import {
    createTerminalInstance,
    useWorkspaceTerminalStore,
} from "@/store/workspace-terminal";
import {
    CreateFileOrFolderResponseSchema,
    DeleteFilesOrFoldersResponseSchema,
    FileTreeEventSchema,
    GetFileResponseSchema,
    ListFileTreeResponseSchema,
    fileTreeManger,
} from "@/utils/workspace-file-tree";
import {
    InstallLSPResponseSchema,
    LSPEventSchema,
    ListLSPsResponseSchema,
    ReadableLSPNameToLSP,
    type SupportedLSP,
    lspManger,
} from "@/utils/workspace-lsp";
import {
    CreateTerminalResponseSchema,
    ListTerminalsResponseSchema,
    RunCommandTerminalResponseSchema,
    TerminalEventSchema,
    terminalManager,
} from "@/utils/workspace-terminal";

import { useToast } from "./toast";

/** Derives workspace URL from current workspace state */
export function useWorkspaceURL(): {
    baseURL: string | null;
    bridgeURL: string | null;
    bridgeWsURL: string | null;
    bridgeV2URL: string | null;
    bridgeV2WsURL: string | null;
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

    const bridgeV2URL = useMemo(
        () => (host ? `http://${host}/_bridge_v2` : null),
        [host],
    );
    const bridgeV2WsURL = useMemo(
        () => (host ? `ws://${host}/_bridge_v2/ws` : null),
        [host],
    );

    return {
        baseURL,
        bridgeURL,
        bridgeWsURL,
        bridgeV2URL,
        bridgeV2WsURL,
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
    const { loadingFiles, addLoadingFile, removeLoadingFile, upsertFile } =
        useWorkspaceStore();

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

    const getFile = useCallback(
        function (absolutePath: string) {
            if (
                bridgeSocket &&
                bridgeWsURL &&
                !isFetching &&
                !loadingFiles.includes(absolutePath)
            ) {
                addLoadingFile(absolutePath);
                bridgeSocket.send(
                    JSON.stringify(fileTreeManger.getFileRequest(absolutePath)),
                );
            }
        },
        [bridgeWsURL, bridgeSocket, isFetching, loadingFiles, addLoadingFile],
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

    const handleGetFileResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = GetFileResponseSchema.parse(data);

            if (parsed?.success) {
                removeLoadingFile(parsed.file.absolutePath);
                upsertFile({
                    absolutePath: parsed.file.absolutePath,
                    content: parsed.content,
                });
            }
        },
        [removeLoadingFile, upsertFile],
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
                case "get-file":
                    handleGetFileResponse(data);
                    break;
            }
        },
        [
            handleGetFileTreeResponse,
            handleCreateFileOrFolderResponse,
            handleDeleteFilesOrFoldersResponse,
            handleGetFileResponse,
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
        getFile,
        createFileOrFolder,
        deleteFilesOrFolders,
        mapRequestToHandler,
    };
}

export function useWorkspaceTerminal() {
    const { bridgeV2WsURL } = useWorkspaceURL();
    const { bridge2Socket } = useWorkspaceBridgeStore();
    const { setTerminals, addTerminal, terminals } = useWorkspaceTerminalStore();
    const { toast } = useToast();

    // ==========================================
    // Send request
    // ==========================================

    const getTerminals = useCallback(
        function () {
            if (bridge2Socket && bridgeV2WsURL) {
                bridge2Socket.send(JSON.stringify(terminalManager.list()));
            }
        },
        [bridgeV2WsURL, bridge2Socket],
    );

    const createTerminal = useCallback(
        function () {
            if (bridge2Socket && bridgeV2WsURL) {
                bridge2Socket.send(JSON.stringify(terminalManager.create()));
            }
        },
        [bridgeV2WsURL, bridge2Socket],
    );

    const deleteTerminal = useCallback(
        function (id: string) {
            if (bridge2Socket && bridgeV2WsURL) {
                bridge2Socket.send(JSON.stringify(terminalManager.delete(id)));
            }
        },
        [bridgeV2WsURL, bridge2Socket],
    );

    // ==========================================
    // Handle response
    // ==========================================

    const handleListTerminalsResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = ListTerminalsResponseSchema.safeParse(data);

            if (parsed.success) {
                setTerminals(
                    parsed.data.payload.map((id) => ({
                        name: "terminal",
                        id: id,
                        xtermInstance: createTerminalInstance(),
                    })),
                );
            }
        },
        [setTerminals],
    );

    const handleCreateTerminalResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = CreateTerminalResponseSchema.safeParse(data);

            if (parsed.success) {
                addTerminal({
                    name: "terminal",
                    id: parsed.data.payload,
                    xtermInstance: createTerminalInstance(),
                });
            } else {
                toast({
                    title: "Failed to create terminal",
                    variant: "error",
                });
            }
        },
        [addTerminal],
    );

    const terminalsRef = useRef(terminals);

    useEffect(() => {
        // Update the ref whenever terminals changes, directly using terminals from
        // zustand store was not updating terminals in the useCallback even if it's in
        // the dependency array
        terminalsRef.current = terminals;
    }, [terminals]);

    const handleRunCommandResponse = useCallback(function (
        data: Record<string, unknown>,
    ) {
        const parsed = RunCommandTerminalResponseSchema.safeParse(data);

        if (parsed.success) {
            const { id, data } = parsed.data.payload;
            const terminal = terminalsRef.current.find((t) => t.id === id);

            if (terminal && typeof data === "string") {
                terminal.xtermInstance.write(data);
            }
        }
    }, []);

    const mapRequestToHandler = useCallback(
        function (data: Record<string, unknown>) {
            const { data: event } = TerminalEventSchema.safeParse(data.event);

            switch (event) {
                case "getTerminals":
                    handleListTerminalsResponse(data);
                    break;
                case "createTerminal":
                    handleCreateTerminalResponse(data);
                    break;
                case "runCommandResponse":
                    handleRunCommandResponse(data);
                    break;
                default:
                    break;
            }
        },
        [
            handleListTerminalsResponse,
            handleCreateTerminalResponse,
            handleRunCommandResponse,
        ],
    );

    return {
        mapRequestToHandler,
        getTerminals,
        createTerminal,
        deleteTerminal,
    };
}

export function useWorkspaceLSP() {
    const { bridgeWsURL } = useWorkspaceURL();
    const { bridgeSocket } = useWorkspaceBridgeStore();
    const { setAvailableLSPs, installedLSPs, setInstalledLSPs } =
        useWorkspaceLSPStore();
    const { toast } = useToast();

    // ==========================================
    // Send request
    // ==========================================

    const listLSPs = useCallback(
        function () {
            if (bridgeSocket && bridgeWsURL) {
                bridgeSocket.send(JSON.stringify(lspManger.list()));
            }
        },
        [bridgeWsURL, bridgeSocket],
    );

    const installLSP = useCallback(
        function (lsp: SupportedLSP) {
            if (bridgeSocket && bridgeWsURL) {
                bridgeSocket.send(JSON.stringify(lspManger.install(lsp)));
            }
        },
        [bridgeWsURL, bridgeSocket],
    );

    // ==========================================
    // Handle response
    // ==========================================

    const handleListLSPsResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = ListLSPsResponseSchema.parse(data);

            if (parsed?.success) {
                setAvailableLSPs(parsed.languageServers);
            }
        },
        [setAvailableLSPs],
    );

    const handleInstallLSPResponse = useCallback(
        function (data: Record<string, unknown>) {
            const parsed = InstallLSPResponseSchema.parse(data);

            if (parsed?.success) {
                let installedLsp: SupportedLSP | null = null;

                Object.entries(ReadableLSPNameToLSP).forEach(([key, value]) => {
                    if (parsed.message.includes(key)) {
                        installedLsp = value;
                    }
                });

                if (installedLsp) {
                    setInstalledLSPs(
                        Array.from(new Set(installedLSPs).add(installedLsp)),
                    );

                    toast({
                        title: "Installation Success",
                        description: parsed.message,
                        variant: "success",
                    });
                }
            } else {
                toast({
                    title: "Installation Failed",
                    description: "Failed to install LSP",
                    variant: "error",
                });
            }
        },
        [toast, installedLSPs, setInstalledLSPs],
    );

    const mapRequestToHandler = useCallback(
        function (data: Record<string, unknown>) {
            const { data: event } = LSPEventSchema.safeParse(data.event);

            switch (event) {
                case "list":
                    handleListLSPsResponse(data);
                    break;
                case "install":
                    handleInstallLSPResponse(data);
                    break;
                default:
                    break;
            }
        },
        [handleListLSPsResponse, handleInstallLSPResponse],
    );

    return {
        mapRequestToHandler,
        listLSPs,
        installLSP,
    };
}

/** Handle the workspace bridge connection. Should be used in one place only */
export function useWorkspaceBridgeConnection() {
    const { bridgeWsURL } = useWorkspaceURL();
    const { setBridgeSocket, setConnectionStatus } = useWorkspaceBridgeStore();

    const { mapRequestToHandler: mapFileTreeRequestToHandler } = useWorkspaceFileTree({
        implicitlyGetFileTree: true,
    });
    const { mapRequestToHandler: mapLSPRequestToHandler } = useWorkspaceLSP();

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
                        mapFileTreeRequestToHandler(parsed);
                        break;
                    }
                    case "lsp": {
                        mapLSPRequestToHandler(parsed);
                        break;
                    }
                    default:
                        break;
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

/** Handle the workspace bridge v2 connection. Should be used in one place only */
export function useWorkspaceBridgeV2Connection() {
    const { bridgeV2WsURL } = useWorkspaceURL();
    const { setBridge2Socket, setConnection2Status } = useWorkspaceBridgeStore();

    const { mapRequestToHandler: mapTerminalRequestToHandler } = useWorkspaceTerminal();

    const handleOpen = useCallback(
        function handleBridge2Open() {
            setConnection2Status("connected");
        },
        [setConnection2Status],
    );

    const handleClose = useCallback(
        function handleBridge2Close() {
            setConnection2Status("disconnected");
        },
        [setConnection2Status],
    );

    const handleMessage = useCallback(function handleBridge2Message(evt: MessageEvent) {
        console.log("Bridge 2 connection message", { evt });

        try {
            const { data } = evt;
            const parsed: Record<string, unknown> = JSON.parse(data);

            if (parsed.type && parsed.event) {
                switch (parsed.type) {
                    case "terminal": {
                        mapTerminalRequestToHandler(parsed);
                        break;
                    }
                    default:
                        break;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(
        function setupBridge2Connection() {
            if (bridgeV2WsURL) {
                const newSocket = new ReconnectingWebSocket(bridgeV2WsURL, [], {
                    maxRetries: 10,
                });

                newSocket.onopen = handleOpen;
                newSocket.onclose = handleClose;
                newSocket.onmessage = handleMessage;

                setBridge2Socket(newSocket);

                return function cleanup() {
                    newSocket.onopen = null;
                    newSocket.onclose = null;
                    newSocket.onmessage = null;
                    newSocket.close();
                };
            }
        },
        [bridgeV2WsURL, setBridge2Socket, handleClose, handleMessage, handleOpen],
    );
}
