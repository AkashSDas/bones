import * as pty from "node-pty";
import { v4 as uuid } from "uuid";

const SHELL = "bash";

/** List of terminal session instances created */
const sessions: TerminalSession[] = [];

export function listSessions(): string[] {
    return sessions.map((t) => t.id);
}

export function createSession(ws: WebSocket): string {
    const session = new TerminalSession(ws);
    sessions.push(session);
    return session.id;
}

export function deleteSession(terminalId: string): void {
    const index = sessions.findIndex((t) => t.id === terminalId);
    if (index === -1) return;

    const session = sessions[index];
    session.ptyInstance.kill();
    sessions.splice(index, 1);
}

export function resizeShellResponse(
    terminalId: string,
    cols: number,
    rows: number,
    ws: WebSocket,
): void {
    // So when you get response after, let's say running the `ls` command, the length
    // of the string response and string formatting is will be based on the size of terminal
    // (i.e. cols and rows) and when in the frontend a terminal is resized, we've to update
    // the Pty instance, and this is exactly what this function does.

    const terminal = sessions.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.ptyInstance.resize(cols, rows);
    terminal.ws = ws;
}

export function runCommand(
    terminalId: string,
    command: string,
    newWs: WebSocket,
): void {
    const terminal = sessions.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.ws = newWs;
    terminal.ptyInstance.write(command);
}

/** A terminal session is represented by an instance of this class */
class TerminalSession {
    id: string;
    ptyInstance: pty.IPty;

    constructor(public ws: WebSocket) {
        this.id = uuid();
        this.ptyInstance = pty.spawn(SHELL, [], {
            name: "xterm-color",
            cols: 80,
            rows: 24,
            cwd: "/usr/workspace",
        });

        this.ptyInstance.onData((data) => {
            // Sending the response that we've received after running a command to the socket connection

            this.ws.send(
                JSON.stringify({
                    type: "terminal",
                    event: "runCommandResponse",
                    payload: {
                        id: this.id,
                        data,
                    },
                }),
            );
        });

        this.ptyInstance.onExit(() => {
            deleteSession(this.id);
        });
    }
}
