import { v1 } from "@std/uuid";
import { Pty } from "jsr:@sigma/pty-ffi";

export type TerminalSessionId = string;

export const terminalSessions: Map<TerminalSessionId, TerminalSession> =
    new Map();

export class TerminalSession {
    private pty: Pty;
    sessionId: TerminalSessionId;

    constructor() {
        this.sessionId = v1.generate();
        this.pty = new Pty({ cmd: "bash", args: [], env: [] });

        terminalSessions.set(this.sessionId, this);
    }

    async runCommand(command: string): Promise<ReturnType<Pty["read"]>> {
        await this.pty.write(command);
        const output = await this.pty.read();
        return output;
    }

    close() {
        this.pty.close();
        terminalSessions.delete(this.sessionId);
    }

    static addSession(session: TerminalSession): void {
        terminalSessions.set(session.sessionId, session);
    }
}
