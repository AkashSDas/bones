import express from "express";
import expressWebsockets from "express-ws";
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";
import {
    createTerminal,
    deleteTerminal,
    listTerminals,
    resize,
    runCommand,
} from "./utils/terminal";

const { app } = expressWebsockets(express());

app.ws("/ws/code-file-collaboration/*", (websocket, request) => {
    const filePath = request.params[0];

    if (filePath) {
        setupWSConnection(websocket, request, { docName: filePath });
    }
});

app.ws("/ws", (websocket, request) => {
    websocket.on("message", (data) => {
        try {
            const parsed = JSON.parse(data.toString());

            switch (parsed.type) {
                case "terminal": {
                    if (parsed.event === "getTerminals") {
                        websocket.send(
                            JSON.stringify({
                                type: "terminal",
                                event: "getTerminals",
                                payload: listTerminals(),
                            })
                        );
                    } else if (parsed.event === "createTerminal") {
                        const id = createTerminal(websocket as any);

                        websocket.send(
                            JSON.stringify({
                                type: "terminal",
                                event: "createTerminal",
                                payload: id,
                            })
                        );
                    } else if (parsed.event === "deleteTerminal") {
                        deleteTerminal(parsed.payload);
                    } else if (parsed.event === "runCommand") {
                        runCommand(
                            parsed.payload.id,
                            parsed.payload.command,
                            websocket as any
                        );
                    } else if (parsed.event === "resize") {
                        const cols = parseFloat(parsed.payload.cols);
                        const rows = parseFloat(parsed.payload.rows);

                        if (!Number.isNaN(rows) && !Number.isNaN(cols)) {
                            resize(
                                parsed.payload.id,
                                parsed.payload.cols,
                                parsed.payload.rows,
                                websocket as any
                            );
                        }
                    }
                    break;
                }
            }
        } catch (e) {}
    });
});

app.listen(4001, () => console.log("Listening on http://127.0.0.1:4001"));
