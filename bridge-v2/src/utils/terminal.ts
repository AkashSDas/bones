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
                    event: "terminalResponse",
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
