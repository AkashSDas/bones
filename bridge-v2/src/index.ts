import express from "express";
import expressWebsockets from "express-ws";
import { Server } from "@hocuspocus/server";

// Configure Hocuspocus
const server = Server.configure({
    // ...
});

// Setup your express instance using the express-ws extension
const { app } = expressWebsockets(express());

// A basic http route
app.get("/ping", (request, response) => {
    response.send("Hello World!");
});

// Add a websocket route for Hocuspocus
// You can set any contextual data like in the onConnect hook
// and pass it to the handleConnection method.
app.ws("/code-file-collaboration", (websocket, request) => {
    const context = {
        user: {
            id: 1234,
            name: "Jane",
        },
    };

    server.handleConnection(websocket, request, context);
});

app.listen(4001, () => console.log("Listening on http://127.0.0.1:4001"));
