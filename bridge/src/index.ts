import { type Context, Hono } from "jsr:@hono/hono";
import { upgradeWebSocket } from "jsr:@hono/hono/deno";
import { status } from "#utils/http.ts";
import { FileSystemWs } from "#ws/fs.ts";
import { LanguageServerPool, LanguageServerWs, SupportedLSPSchema } from "#ws/lsp.ts";
import { IWebSocket } from "vscode-ws-jsonrpc";

const app = new Hono();

// Testing endpoint for checking if this bridge server is running or not
app.get("/ping", (c: Context) => {
    return c.json({ message: "Bridge is active" }, status.OK);
});

app.get(
    "/ws",
    upgradeWebSocket((_c) => {
        return {
            onOpen: () => {
                console.log("Connection opened");
            },
            async onMessage(event, ws) {
                try {
                    const { data } = event;
                    const parsed = JSON.parse(data.toString());

                    switch (parsed.type) {
                        case "fs": {
                            const instance = new FileSystemWs(ws, parsed);
                            await instance.handleWsRequest();
                            break;
                        }
                        case "lsp": {
                            const instance = new LanguageServerWs(ws, parsed);
                            await instance.handleWsRequest();
                            break;
                        }
                        default:
                            ws.send(
                                JSON.stringify({
                                    success: false,
                                    error:
                                        `Failed to parse incoming data: Invalid request type`,
                                }),
                            );
                            break;
                    }
                } catch (e) {
                    console.log(e);
                    ws.send(
                        JSON.stringify({
                            success: false,
                            error: `Failed to parse incoming data: ${e}`,
                        }),
                    );
                }
            },
            onClose: () => {
                console.log("Connection closed");
            },
        };
    }),
);

// WebSocket endpoint for handling communication between Moncao Editor and the running
// language server. The `:lsp` param is the LSP name. This is acting as a "bridge" between
// the running language server and the Moncao Editor
app.get(
    "/ws/lsp/:lsp",
    upgradeWebSocket(function handleLSPWebsocketConnection(c) {
        const lsp = c.req.param("lsp");
        const { data: parsed } = SupportedLSPSchema.safeParse(lsp);

        return {
            onOpen(_event, ws) {
                const honoSocket = ws.raw;

                console.log(`Connection opened for LSP: ${lsp}`);

                if (parsed) {
                    if (!honoSocket) throw new Error("Socket not found");

                    const lspSocket: IWebSocket = {
                        send: (content: string | ArrayBuffer | Uint8Array) =>
                            ws.send(content),
                        onMessage: (cb: (data: unknown) => void) => {
                            honoSocket.onmessage = (event) => {
                                cb(event.data);
                            };
                        },
                        onError: (
                            cb: ((e: Event | ErrorEvent) => unknown) | null,
                        ) => {
                            honoSocket.onerror = cb;
                        },
                        // deno-lint-ignore no-explicit-any
                        onClose: (cb: any) => {
                            honoSocket.onclose = cb;
                        },
                        dispose: () => honoSocket.close(),
                    };

                    const pool = new LanguageServerPool();
                    pool.launchServer(parsed, lspSocket);
                } else {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: `Unsupported Language Server: ${lsp}`,
                        }),
                    );
                }
            },
        };
    }),
);

Deno.serve({ port: 4000 }, app.fetch);
