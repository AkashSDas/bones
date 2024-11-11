import { type Context, Hono } from "jsr:@hono/hono";
import { upgradeWebSocket } from "jsr:@hono/hono/deno";
import { status } from "#utils/http.ts";

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
            onMessage(event, ws) {
                console.log(`Message from client: ${event.data}`);
                ws.send("Hello from server!");
            },
            onClose: () => {
                console.log("Connection closed");
            },
        };
    })
);

Deno.serve({ port: 4000 }, app.fetch);
