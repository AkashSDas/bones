import { type WSContext } from "@hono/hono/ws";
import { z } from "npm:zod";
import { TerminalSession, terminalSessions } from "#utils/terminal.ts";

// ==========================================
// Schemas
// ==========================================

const EventSchema = z.union([
    z.literal("close"),
    z.literal("create"),
    z.literal("runCommand"),
]);

const ClosePayloadSchema = z.object({
    sessionIds: z.array(z.string().uuid()),
});

const RunCommandPayloadSchema = z.object({
    sessionId: z.string().uuid(),
    command: z.string(),
});

// ==========================================
// Websocket handler
// ==========================================

export class TerminalWs {
    public event: z.infer<typeof EventSchema> | undefined;
    public payload: unknown;

    constructor(public ws: WSContext, public data: Record<string, unknown>) {
        const { data: event } = EventSchema.safeParse(data.event);

        this.event = event;
        this.payload = data.payload;
    }

    async handleWsRequest() {
        switch (this.event) {
            case "close":
                this.ws.send(await this.close());
                break;
            case "create":
                this.ws.send(this.create());
                break;
            case "runCommand":
                this.ws.send(await this.runCommand());
                break;
            default:
                this.ws.send(
                    this.returnResult({
                        success: false,
                        error: `Invalid event type`,
                    })
                );
                break;
        }
    }

    // ==================================
    // Handlers
    // ==================================

    /**
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "terminal",
     *     "event": "close",
     *     "payload": {
     *         "sessionIds": ["1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o"]
     *     }
     * }
     * ```
     */
    private async close(): Promise<string> {
        const { success, data } = await ClosePayloadSchema.safeParseAsync(
            this.payload
        );

        if (success) {
            for (const id of data.sessionIds) {
                terminalSessions.get(id)?.close();
            }

            return this.returnResult({ success: true });
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "terminal",
     *     "event": "create",
     * }
     * ```
     */
    private create(): string {
        const session = new TerminalSession();
        TerminalSession.addSession(session);

        return this.returnResult({
            success: true,
            sessionId: session.sessionId,
        });
    }

    /**
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "terminal",
     *     "event": "runCommand",
     *     "payload": {
     *         "command": "ls -la"
     *     }
     * }
     * ```
     */
    private async runCommand(): Promise<string> {
        const { success, data } = await RunCommandPayloadSchema.safeParseAsync(
            this.payload
        );

        if (success) {
            const session = terminalSessions.get(data.sessionId);

            if (!session) {
                return this.returnResult({
                    success: false,
                    message: "Session not found",
                });
            } else {
                const output = session.runCommand(data.command);
                return this.returnResult({ success: true, ...output });
            }
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    private returnResult(res: Record<string, unknown>): string {
        return JSON.stringify({
            type: "terminal",
            event: this.event,
            ...res,
        });
    }
}
