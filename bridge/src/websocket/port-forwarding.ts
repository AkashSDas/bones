import { type WSContext } from "@hono/hono/ws";
import { z } from "npm:zod";
import { portMappingManager, PortSchema } from "#utils/port-mapping.ts";

// ==========================================
// Schemas
// ==========================================

const EventSchema = z.union([
    z.literal("get-available-ports"),
    z.literal("get-current-mapping"),
    z.literal("create"),
    z.literal("delete"),
]);

const CreateMappingPayloadSchema = z.object({
    externalPort: PortSchema,
    internalPort: PortSchema,
});

const DeleteMappingPayloadSchema = z.object({
    externalPort: PortSchema,
    internalPort: PortSchema,
});

// ==========================================
// WebSocket handler
// ==========================================

export class PortForwardingWs {
    public event: z.infer<typeof EventSchema> | undefined;
    public payload: unknown;

    constructor(
        public ws: WSContext,
        public data: Record<string, unknown>,
    ) {
        const { data: event } = EventSchema.safeParse(data.event);

        this.event = event;
        this.payload = data.payload;
    }

    async handleWsRequest() {
        switch (this.event) {
            case "get-available-ports":
                this.ws.send(await this.getAvailablePorts());
                break;
            case "get-current-mapping":
                this.ws.send(await this.getCurrentMapping());
                break;
            case "create":
                this.ws.send(await this.create());
                break;
            case "delete":
                this.ws.send(await this.delete());
                break;
            default:
                this.ws.send(
                    this.returnResult({
                        success: false,
                        error: `Invalid event type`,
                    }),
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
     *     "type": "port-forwarding",
     *     "event": "get-current-mapping"
     * }
     * ```
     */
    private async getCurrentMapping(): Promise<string> {
        const res = await portMappingManager.listCurrentMapping();

        if (res instanceof Error) {
            return this.returnResult({ success: false, error: res.message });
        } else {
            return this.returnResult({
                success: true,
                currentMapping: res,
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "port-forwarding",
     *     "event": "get-available-ports"
     * }
     * ```
     */
    private async getAvailablePorts(): Promise<string> {
        const res = await portMappingManager.listAvailableExternalPorts();

        if (res instanceof Error) {
            return this.returnResult({ success: false, error: res.message });
        } else {
            return this.returnResult({
                success: true,
                availableExternalPorts: res,
            });
        }
    }

    /**
     * Required incoming WS data:
     *
     * ```json
     * {
     *     "type": "port-forwarding",
     *     "event": "create",
     *     "payload": {
     *         "externalPort": 80,
     *         "internalPort": 8000,
     *     }
     * }
     * ```
     */
    private async create(): Promise<string> {
        const { success, data } =
            await CreateMappingPayloadSchema.safeParseAsync(this.payload);

        if (success) {
            const res = await portMappingManager.create(
                data.internalPort,
                data.externalPort,
            );

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            } else {
                return this.returnResult({ success: true });
            }
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
     *     "type": "port-forwarding",
     *     "event": "delete",
     *     "payload": {
     *         "externalPort": 80,
     *         "internalPort": 8000,
     *     }
     * }
     * ```
     */
    private async delete(): Promise<string> {
        const { success, data } =
            await DeleteMappingPayloadSchema.safeParseAsync(this.payload);

        if (success) {
            const res = await portMappingManager.delete(
                data.internalPort,
                data.externalPort,
            );

            if (res instanceof Error) {
                return this.returnResult({
                    success: false,
                    error: res.message,
                });
            } else {
                return this.returnResult({ success: true });
            }
        } else {
            return this.returnResult({
                success: false,
                error: "Invalid payload",
            });
        }
    }

    // ==================================
    // Helpers
    // ==================================

    private returnResult(res: Record<string, unknown>): string {
        return JSON.stringify({
            type: "fs",
            event: this.event,
            ...res,
        });
    }
}
