import { type Context, Hono } from "jsr:@hono/hono";
import { upgradeWebSocket } from "jsr:@hono/hono/deno";
import { status } from "#utils/http.ts";
import { FileSystemWs } from "#ws/fs.ts";

const app = new Hono();

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

Deno.serve({ port: 4000 }, app.fetch);
