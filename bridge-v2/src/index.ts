import express from "express";
import expressWebsockets from "express-ws";
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";

const { app } = expressWebsockets(express());

app.ws("/code-file-collaboration/*", (websocket, request) => {
    const filePath = request.params[0];

    if (filePath) {
        setupWSConnection(websocket, request, { docName: filePath });
    }
});

app.listen(4001, () => console.log("Listening on http://127.0.0.1:4001"));
