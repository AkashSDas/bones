import * as pty from "node-pty";
import { v4 as uuid } from "uuid";

const SHELL = "bash";

const terminals: TerminalManager[] = [];

export function listTerminals() {
    return terminals.map((t) => t.id);
}

export function createTerminal(ws: WebSocket) {
    const terminal = new TerminalManager(ws);
    terminals.push(terminal);
    return terminal.id;
}

export function deleteTerminal(terminalId: string) {
    const index = terminals.findIndex((t) => t.id === terminalId);
    if (index === -1) return;

    const terminal = terminals[index];
    terminal.ptyInstance.kill();
    terminals.splice(index, 1);
}

export function resize(
    terminalId: string,
    cols: number,
    rows: number,
    ws: WebSocket
) {
    const terminal = terminals.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.ptyInstance.resize(cols, rows);
    terminal.ws = ws;
}

export function runCommand(
    terminalId: string,
    command: string,
    newWs: WebSocket
) {
    const terminal = terminals.find((t) => t.id === terminalId);
    if (!terminal) return;

    terminal.ws = newWs;
    terminal.ptyInstance.write(command);
}

class TerminalManager {
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
            this.ws.send(
                JSON.stringify({
                    type: "terminal",
                    event: "runCommandResponse",
                    payload: {
                        id: this.id,
                        data,
                    },
                })
            );
        });

        this.ptyInstance.onExit(() => {
            deleteTerminal(this.id);
        });
    }
}
