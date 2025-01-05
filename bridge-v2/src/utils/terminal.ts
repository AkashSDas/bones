import * as pty from "node-pty";
import { v4 as uuid } from "uuid";

const SHELL = "bash";

class TerminalManager {
    terminals: {
        ptyInstance: pty.IPty;
        id: string;
    }[] = [];

    constructor() {}

    list() {
        return this.terminals.map((t) => t.id);
    }

    delete(id: string) {
        const index = this.terminals.findIndex((t) => t.id === id);
        if (index === -1) return;

        const terminal = this.terminals[index];
        terminal.ptyInstance.kill();
        this.terminals.splice(index, 1);
    }

    runCommand(id: string, command: string) {
        const terminal = this.terminals.find((t) => t.id === id);
        if (!terminal) return;

        terminal.ptyInstance.write(command);
    }

    resize(id: string, cols: number, rows: number) {
        const terminal = this.terminals.find((t) => t.id === id);
        if (!terminal) return;

        terminal.ptyInstance.resize(cols, rows);
    }

    create(ws: WebSocket) {
        const id = uuid();
        const ptyInstance = pty.spawn(SHELL, [], {
            name: "xterm-color",
            cols: 80,
            rows: 24,
            cwd: "/usr/workspace",
        });

        ptyInstance.onData((data) => {
            ws.send(
                JSON.stringify({
                    type: "terminal",
                    event: "runCommandResponse",
                    payload: {
                        id,
                        data,
                    },
                })
            );
        });

        ptyInstance.onExit(() => {
            this.delete(id);
        });

        this.terminals.push({ ptyInstance, id });

        return id;
    }
}

export const terminalManager = new TerminalManager();
