import { type WSContext } from "@hono/hono/ws";
import { fileSystemManager } from "#utils/fs.ts";
import { z } from "npm:zod";

// ==========================================
// Schemas
// ==========================================

const EventSchema = z.union([
    z.literal("get-file"),
    z.literal("list"),
    z.literal("create"),
    z.literal("rename"),
    z.literal("delete"),
    z.literal("move"),
    z.literal("copy"),
    z.literal("search-text-in-files"),
    z.literal("search-file"),
]);

const GetFilePayloadSchema = z.object({
    absolutePath: z.string(),
});

const CreateFileOrFolderPayloadSchema = z.object({
    name: z.string().min(3),
    absolutePath: z.string(),
    isDirectory: z.boolean(),
});

const RenameFileOrFolderPayloadSchema = z.object({
    name: z.string().min(3),
    absolutePath: z.string(),
});

const DeleteFileOrFolderPayloadSchema = z.object({
    absolutePaths: z.array(z.string().min(3)).min(1),
});

const MoveFileOrFolderPayloadSchema = z.object({
    absoluteSourcePaths: z.array(z.string().min(3)).min(1),
    absoluteDestinationPath: z.string(),
});

const CopyFileOrFolderPayloadSchema = z.object({
    absoluteSourcePaths: z.array(z.string().min(3)).min(1),
    absoluteDestinationPath: z.string(),
});

const SearchTextInFilesPayloadSchema = z.object({
    query: z.string().min(3),
    matchCase: z.boolean(),
    matchWholeWord: z.boolean(),
    useRegex: z.boolean(),
});

const SearchFilePayloadSchema = z.object({
    query: z.string().min(3),
});

// ==========================================
// Websocket handler
// ==========================================

export class FileSystemWs {
    public event: z.infer<typeof EventSchema> | undefined;
    public payload: unknown;

    constructor(public ws: WSContext, public data: Record<string, unknown>) {
        const { data: event } = EventSchema.safeParse(data.event);

        this.event = event;
        this.payload = data.payload;
    }

    async handleWsRequest() {
        switch (this.event) {
            case "get-file":
                this.ws.send(await this.getFile());
                break;
            case "list":
                this.ws.send(await this.listFileTree());
                break;
            case "create":
                this.ws.send(await this.createFileOrFolder());
                break;
            case "rename":
                this.ws.send(await this.renameFileOrFolder());
                break;
            case "delete":
                this.ws.send(await this.deleteFilesOrFolders());
                break;
            case "move":
                this.ws.send(await this.moveFilesOrFolders());
                break;
            case "copy":
                this.ws.send(await this.copyFilesOrFolders());
                break;
            case "search-text-in-files":
                this.ws.send(await this.searchTextInFiles());
                break;
            case "search-file":
                this.ws.send(await this.searchFile());
                break;
            default:
                this.ws.send(
                    this.returnResult({
                        success: false,
                        error: `Invalid event type`,
                    }),
                );
                break;
        }
    }

    // ==================================
    // Handlers
    // ==================================

    /**
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "fs",
     *     "event": "get-file",
     *     "payload": {
     *         "absolutePath": "/usr/workspace"
     *     }
     * }
     * ```
     */
    private async getFile(): Promise<string> {
        const { success, data } = await GetFilePayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.getFile(data.absolutePath);

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            } else {
                return this.returnResult({
                    success: true,
                    ...res,
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
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "fs",
     *     "event": "list"
     * }
     * ```
     */
    private async listFileTree(): Promise<string> {
        const res = await fileSystemManager.listWorkspaceFileTree();

        if (res instanceof Error) {
            return this.returnResult({ success: false, error: res.message });
        } else {
            return this.returnResult({ success: true, fileTree: res });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "create",
     *     "payload": {
     *         "name": "index.js",
     *         "absolutePath": "/usr/workspace",
     *         "isDirectory": false
     *     }
     * }
     * ```
     */
    private async createFileOrFolder(): Promise<string> {
        const { success, data } = await CreateFileOrFolderPayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.createFileOrFolder(
                data.name,
                data.absolutePath,
                data.isDirectory,
            );

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            } else {
                return this.returnResult({
                    success: true,
                    newFileOrFolder: res,
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
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "rename",
     *     "payload": {
     *         "name": "index.js",
     *         "absolutePath": "/usr/workspace"
     *     }
     * }
     * ```
     */
    private async renameFileOrFolder(): Promise<string> {
        const { success, data } = await RenameFileOrFolderPayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.renameFileOrFolder(
                data.absolutePath,
                data.name,
            );

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            } else {
                return this.returnResult({
                    success: true,
                    updatedFileOrFolder: res,
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
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "delete",
     *     "payload": {
     *         "absolutePaths": ["/usr/workspace/index.go", "/usr/workspace/utils"]
     *     }
     * }
     * ```
     */
    private async deleteFilesOrFolders(): Promise<string> {
        const { success, data } = await DeleteFileOrFolderPayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            await fileSystemManager.deleteFilesOrFolders(data.absolutePaths);
            return this.returnResult({ success: true });
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "move",
     *     "payload": {
     *         "absoluteSourcePaths": ["/usr/workspace/index.go", "/usr/workspace/utils"]
     *         "absoluteDestinationPath": "/usr/workspace/bin"
     *     }
     * }
     * ```
     */
    private async moveFilesOrFolders(): Promise<string> {
        const { success, data } = await MoveFileOrFolderPayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.moveFilesOrFolders(
                data.absoluteSourcePaths,
                data.absoluteDestinationPath,
            );

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            }

            return this.returnResult({
                success: true,
                movedFilesOrFolders: res.map((v) => {
                    if (v instanceof Error) {
                        return v.message;
                    } else {
                        return v;
                    }
                }),
            });
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "copy",
     *     "payload": {
     *         "absoluteSourcePaths": ["/usr/workspace/index.go", "/usr/workspace/utils"]
     *         "absoluteDestinationPath": "/usr/workspace/bin"
     *     }
     * }
     * ```
     */
    private async copyFilesOrFolders(): Promise<string> {
        const { success, data } = await CopyFileOrFolderPayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.copyFilesOrFolders(
                data.absoluteSourcePaths,
                data.absoluteDestinationPath,
            );

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            }

            return this.returnResult({
                success: true,
                copiedFilesOrFolders: res.map((v) => {
                    if (v instanceof Error) {
                        return v.message;
                    } else {
                        return v;
                    }
                }),
            });
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "search-text-in-files",
     *     "payload": {
     *     "useRegex": false
     *        "query": "App",
     *        "matchCase": false,
     *        "matchWholeWord": false,
     *        "useRegex": false
     *     }
     * }
     * ```
     */
    private async searchTextInFiles(): Promise<string> {
        const { success, data } = await SearchTextInFilesPayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.searchTextInFiles(data.query, {
                matchCase: data.matchCase,
                matchWholeWord: data.matchWholeWord,
                useRegex: data.useRegex,
            });

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            }

            return this.returnResult({
                success: true,
                total: res.total,
                results: res.results,
            });
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```
     * {
     *     "type": "fs",
     *     "event": "search-file",
     *     "payload": {
     *     "useRegex": false
     *        "query": "App",
     *     }
     * }
     * ```
     */
    private async searchFile(): Promise<string> {
        const { success, data } = await SearchFilePayloadSchema.safeParseAsync(
            this.payload,
        );

        if (success) {
            const res = await fileSystemManager.searchFileByName(data.query);

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            }

            return this.returnResult({ success: true, results: res });
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    private returnResult(res: Record<string, unknown>): string {
        return JSON.stringify({
            type: "fs",
            event: this.event,
            ...res,
        });
    }
}
