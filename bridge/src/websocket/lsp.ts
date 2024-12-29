import { type WSContext } from "@hono/hono/ws";
import { z } from "npm:zod";
import { RequestMessage } from "npm:vscode-jsonrpc/lib/node/main.js";
import * as rpc from "npm:vscode-ws-jsonrpc";
import * as server from "npm:vscode-ws-jsonrpc/server";
import {
    InitializeParams,
    InitializeRequest,
    Message,
} from "npm:vscode-languageserver";

// ==========================================
// Schemas
// ==========================================

export const SupportedLSPSchema = z.union([
    z.literal("gopls"),
    z.literal("pyrightLangserver"),
    z.literal("typescriptLanguageServer"),
    z.literal("jsonLanguageServer"),
    z.literal("cssLanguageServer"),
    z.literal("htmlLanguageServer"),
    z.literal("tomlLanguageServer"),
    z.literal("rustLanguageServer"),
]);

type SupportedLSP = z.infer<typeof SupportedLSPSchema>;

const EventSchema = z.union([z.literal("install"), z.literal("list")]);

const InstallPayloadSchema = z.object({
    lsp: SupportedLSPSchema,
});

// ==========================================
// WebSocket handler
// ==========================================

const lspCommandMapping: Record<
    SupportedLSP,
    {
        lspName: SupportedLSP;
        lspReadableName: string;
        runCommand: string[];
        installCommand: string[];
        installationPrerequisite: {
            toolName: string;
            description: string;
            exampleInstallCommand?: string;
        }[];
        extension: string;
    }
> = {
    gopls: {
        lspName: "gopls",
        lspReadableName: "Gopls",
        runCommand: ["gopls"],
        installCommand: ["go", "install", "golang.org/x/tools/gopls@latest"],
        installationPrerequisite: [
            {
                toolName: "Go",
                description: "Go is required to install gopls",
                exampleInstallCommand: "apt install golang",
            },
        ],
        extension: "go",
    },
    pyrightLangserver: {
        lspName: "pyrightLangserver",
        lspReadableName: "Pyright",
        runCommand: ["pyright-langserver", "--stdio"],
        installCommand: ["pip", "install", "pyright"],
        installationPrerequisite: [
            {
                toolName: "Python PIP",
                description: `PIP is required to install Pyright Language Server`,
                exampleInstallCommand: "apt install python3-pip",
            },
        ],
        extension: "py",
    },
    typescriptLanguageServer: {
        lspName: "typescriptLanguageServer",
        lspReadableName: "TypeScript Language Server",
        runCommand: [
            "typescript-language-server",
            "--stdio",
            "--log-level",
            "info",
        ],
        installCommand: [
            "npm",
            "install",
            "-g",
            "typescript-language-server",
            "typescript",
            "--no-update-notifier",
        ],
        installationPrerequisite: [
            {
                toolName: "NodeJs Npm",
                description: `Npm is required to install TypeScript Language Server`,
                exampleInstallCommand: "apt install npm",
            },
        ],
        extension: "ts",
    },
    jsonLanguageServer: {
        lspName: "jsonLanguageServer",
        lspReadableName: "JSON",
        runCommand: ["vscode-json-languageserver", "--stdio"],
        installCommand: [
            "npm",
            "install",
            "-g",
            "vscode-json-languageserver",
            "--no-update-notifier",
        ],
        installationPrerequisite: [
            {
                toolName: "NodeJs Npm",
                description: `Npm is required to install TypeScript Language Server`,
                exampleInstallCommand: "apt install npm",
            },
        ],
        extension: "json",
    },
    cssLanguageServer: {
        lspName: "cssLanguageServer",
        lspReadableName: "CSS",
        runCommand: ["css-languageserver", "--stdio"],
        installCommand: [
            "npm",
            "install",
            "-g",
            "vscode-css-languageserver-bin",
            "--no-update-notifier",
        ],
        installationPrerequisite: [
            {
                toolName: "NodeJs Npm",
                description: `Npm is required to install TypeScript Language Server`,
                exampleInstallCommand: "apt install npm",
            },
        ],
        extension: "css",
    },
    htmlLanguageServer: {
        lspName: "htmlLanguageServer",
        lspReadableName: "HTML",
        runCommand: ["html-languageserver", "--stdio"],
        installCommand: [
            "npm",
            "install",
            "-g",
            "vscode-html-languageserver-bin",
            "--no-update-notifier",
        ],
        installationPrerequisite: [
            {
                toolName: "NodeJs Npm",
                description: `Npm is required to install TypeScript Language Server`,
                exampleInstallCommand: "apt install npm",
            },
        ],
        extension: "html",
    },
    tomlLanguageServer: {
        lspName: "tomlLanguageServer",
        lspReadableName: "Toml",
        runCommand: ["taplo-lsp", "stdio"],
        installCommand: ["cargo", "install", "taplo-cli"],
        installationPrerequisite: [
            {
                toolName: "Rust",
                description: `Rust is required to install Rust Language Server`,
                exampleInstallCommand: "apt install rustc",
            },
        ],
        extension: "toml",
    },
    rustLanguageServer: {
        lspName: "rustLanguageServer",
        lspReadableName: "Rust Language Server",
        runCommand: ["rust-analyzer"],
        installCommand: ["rustup", "component", "add", "rust-analyzer"],
        installationPrerequisite: [
            {
                toolName: "Rust",
                description: `Rust is required to install Rust Language Server`,
                exampleInstallCommand: "apt install rustc",
            },
        ],
        extension: "rs",
    },
};

export class LanguageServerWs {
    public event: z.infer<typeof EventSchema> | undefined;
    public payload: unknown;

    constructor(public ws: WSContext, public data: Record<string, unknown>) {
        const { data: event } = EventSchema.safeParse(data.event);

        this.event = event;
        this.payload = data.payload;
    }

    async handleWsRequest() {
        switch (this.event) {
            case "install":
                this.ws.send(await this.install());
                break;
            case "list":
                this.ws.send(this.listAvailableLSPs());
                break;
            default:
                this.ws.send(
                    this.returnResult({
                        success: false,
                        error: `Invalid event type`,
                    })
                );
                break;
        }
    }

    // ================================
    // Handlers
    // ================================

    /**
     * Install a language server
     *
     * @example
     * ```json
     * {
     *     "type": "lsp",
     *     "event": "install",
     *     "payload": {
     *         "lsp": "gopls",
     *         "language": "go"
     *     }
     * }
     * ```
     */
    private async install(): Promise<string> {
        const { success, data } = await InstallPayloadSchema.safeParseAsync(
            this.payload
        );

        if (success) {
            const config = lspCommandMapping[data.lsp];

            const isSetupValid = await this.validateToolInstalled(
                config.installCommand[0]
            );
            if (!isSetupValid) {
                return this.returnResult({
                    success: false,
                    error: `Prerequisite for ${data.lsp} installation is missing`,
                });
            }

            const installProcess = new Deno.Command(config.installCommand[0], {
                args: config.installCommand.slice(1),
            });
            const { success } = await installProcess.output();

            if (!success) {
                return this.returnResult({
                    success: false,
                    error: `Failed to install ${data.lsp} language server`,
                });
            } else {
                return this.returnResult({
                    success: true,
                    message: `${
                        lspCommandMapping[data.lsp].lspReadableName
                    } installed successfully`,
                });
            }
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    /**
     * Get list of language servers
     *
     * @example
     * ```json
     * {
     *     "type": "lsp",
     *     "event": "list",
     * }
     * ```
     */
    private listAvailableLSPs(): string {
        return this.returnResult({
            success: true,
            languageServers: Object.values(lspCommandMapping).map((lsp) => ({
                lspName: lsp.lspName,
                lspReadableName: lsp.lspReadableName,
                installationPrerequisite: lsp.installationPrerequisite,
                extension: lsp.extension,
            })),
        });
    }

    /**
     * Helper method to return standardized WebSocket response
     */
    private returnResult(res: Record<string, unknown>): string {
        return JSON.stringify({
            type: "lsp",
            event: this.event,
            ...res,
        });
    }

    /**
     * Check if the required command for setup exists.
     * @param command - The command to check (e.g., "go", "pip").
     * @returns True if the command exists, otherwise false.
     */
    private async validateToolInstalled(command: string): Promise<boolean> {
        try {
            const checkProcess = new Deno.Command(command, {
                args: ["--version"], // A harmless check command
            });
            const { success } = await checkProcess.output();
            return success;
        } catch (error) {
            console.error(`Command ${command} not found:`, error);
            return false;
        }
    }
}

const lspProcessMapping: Map<SupportedLSP, unknown> = new Map();

export class LanguageServerPool {
    constructor() {}

    isInitializeRequest(message: RequestMessage) {
        return message.method === InitializeRequest.type.method;
    }

    launchServer(lsp: SupportedLSP, socket: rpc.IWebSocket) {
        if (lspProcessMapping.get(lsp)) {
            console.log(`${lsp} server already running`);
            return;
        }

        const reader = new rpc.WebSocketMessageReader(socket);
        const writer = new rpc.WebSocketMessageWriter(socket);

        const socketConnection = server.createConnection(reader, writer, () =>
            socket.dispose()
        );

        const config = lspCommandMapping[lsp];
        const serverConnection = server.createServerProcess(
            config.lspReadableName,
            config.runCommand[0],
            config.runCommand.slice(1)
        );

        console.log(`${config.lspReadableName} server started`);

        if (socketConnection && serverConnection) {
            server.forward(
                socketConnection,
                serverConnection,
                function forwardOrReceiveMessageToLSP(message: Message) {
                    if (Message.isRequest(message)) {
                        console.log(
                            `${config.lspReadableName} Server received: ${message}`
                        );

                        if (message.method === InitializeRequest.type.method) {
                            const initializeParams =
                                message.params as InitializeParams;
                            initializeParams.processId = Deno.pid;
                        }
                    }

                    if (Message.isResponse(message)) {
                        console.log(
                            `${config.lspReadableName} Server sent: ${message}`
                        );
                    }

                    return message;
                }
            );

            console.log(`${config.lspReadableName} Server connected`);
        }
    }
}
