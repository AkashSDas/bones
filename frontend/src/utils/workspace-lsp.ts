import { MonacoLanguageClient } from "monaco-languageclient";
import { Uri } from "vscode";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import {
    WebSocketMessageReader,
    WebSocketMessageWriter,
    toSocket,
} from "vscode-ws-jsonrpc";
import { z } from "zod";

import { useWorkspaceLSPStore } from "@/store/workspace-lsp";

// ==========================================
// Schemas
// ==========================================

export const LSPEventSchema = z.union([
    z.literal("install"),
    z.literal("list"),
    z.literal("listInstalled"),
]);

const SupportedLSPSchema = z.union([
    z.literal("gopls"),
    z.literal("pyrightLangserver"),
    z.literal("typescriptLanguageServer"),
    z.literal("jsonLanguageServer"),
    z.literal("cssLanguageServer"),
    z.literal("htmlLanguageServer"),
]);

export const LanguageLSPMapping: Record<string, SupportedLSP> = {
    go: "gopls",
    python: "pyrightLangserver",
    typescript: "typescriptLanguageServer",
    json: "jsonLanguageServer",
    css: "cssLanguageServer",
    html: "htmlLanguageServer",
};

export const ReadableLSPNameToLSP: Record<string, SupportedLSP> = {
    Gopls: "gopls",
    Pyright: "pyrightLangserver",
    "TypeScript Language Server": "typescriptLanguageServer",
    JSON: "jsonLanguageServer",
    CSS: "cssLanguageServer",
    HTML: "htmlLanguageServer",
};

export type SupportedLSP = z.infer<typeof SupportedLSPSchema>;

// =====================================
// Request Body
// =====================================

const _ListLSPsRequestSchema = z.object({
    type: z.literal("lsp"),
    event: z.literal("list"),
});

const _InstallLSPRequestSchema = z.object({
    type: z.literal("lsp"),
    event: z.literal("install"),
    payload: z.object({ lsp: SupportedLSPSchema }),
});

const _ListInstalledLSPsRequestSchema = z.object({
    type: z.literal("lsp"),
    event: z.literal("listInstalled"),
});

// =====================================
// Response Body
// =====================================

function getErrorSchema<T>(literal: z.ZodLiteral<T>) {
    return z.object({
        type: z.literal("lsp"),
        event: literal,
        success: z.literal(false),
        error: z.string(),
    });
}

export const ListLSPsResponseSchema = z.union([
    z.object({
        type: z.literal("lsp"),
        event: z.literal("list"),
        success: z.literal(true),
        languageServers: z.array(
            z.object({
                lspName: z.string(),
                lspReadableName: z.string(),
                extension: z.string(),
                installationPrerequisite: z.array(
                    z.object({
                        toolName: z.string(),
                        description: z.string(),
                        exampleInstallCommand: z.string().optional(),
                    }),
                ),
            }),
        ),
    }),
    getErrorSchema(z.literal("list")),
]);

export const InstallLSPResponseSchema = z.union([
    z.object({
        type: z.literal("lsp"),
        event: z.literal("install"),
        success: z.literal(true),
        message: z.string(),
    }),
    getErrorSchema(z.literal("install")),
]);

export const ListInstalledLSPsResponseSchema = z.union([
    z.object({
        type: z.literal("lsp"),
        event: z.literal("listInstalled"),
        success: z.literal(true),
        languageServers: z.array(
            z.object({
                lspName: z.string(),
                lspReadableName: z.string(),
                extension: z.string(),
                installationPrerequisite: z.array(
                    z.object({
                        toolName: z.string(),
                        description: z.string(),
                        exampleInstallCommand: z.string().optional(),
                    }),
                ),
            }),
        ),
    }),
    getErrorSchema(z.literal("list")),
]);

// ==========================================
// Helper
// ==========================================

class WorkspaceLSPManager {
    listAvailable(): z.infer<typeof _ListLSPsRequestSchema> {
        return {
            type: "lsp",
            event: "list",
        };
    }

    install(lsp: SupportedLSP): z.infer<typeof _InstallLSPRequestSchema> {
        return {
            type: "lsp",
            event: "install",
            payload: {
                lsp,
            },
        };
    }

    listInstalled(): z.infer<typeof _ListInstalledLSPsRequestSchema> {
        return {
            type: "lsp",
            event: "listInstalled",
        };
    }
}

export const lspManger = new WorkspaceLSPManager();

// ==========================================
// Connect MonacoEditor to Language Server
// ==========================================

export function initLSPWebsocketAndStartLanguageClient(
    socketURL: string,
    language: string,
    lsp: SupportedLSP,
): WebSocket {
    const bridgeSocket = new WebSocket(socketURL);

    bridgeSocket.onopen = () => {
        // Create message transport
        const socket = toSocket(bridgeSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);

        const client = createMonacoLanguageClient({ reader, writer }, language);
        client.start();

        // This won't re-render components
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useWorkspaceLSPStore().setInitializedLSPs(
            // eslint-disable-next-line react-hooks/rules-of-hooks
            Array.from(new Set(useWorkspaceLSPStore().initializedLSPs).add(lsp)),
        );

        reader.onClose(() => client.stop());
    };

    return bridgeSocket;
}

function createMonacoLanguageClient(
    transports: MessageTransports,
    language: string,
): MonacoLanguageClient {
    return new MonacoLanguageClient({
        name: `${language} Language Client`,
        clientOptions: {
            documentSelector: [language],
            workspaceFolder: {
                index: 0,
                name: "workspace",
                uri: Uri.parse("/usr/workspace"),
            },

            // Disable the default error handler
            errorHandler: {
                error: (_error, message, _count) => {
                    console.error(
                        `Error occurred in ${language} language client: ${message}`,
                    );

                    return {
                        action: ErrorAction.Continue,
                    };
                },
                closed: () => ({ action: CloseAction.DoNotRestart }),
            },
        },

        // Create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            },
        },
    });
}
