import { z } from "zod";

// ==========================================
// Schemas
// ==========================================

export const PortForwardingEventSchema = z.union([
    z.literal("get-available-ports"),
    z.literal("get-current-mapping"),
    z.literal("create"),
    z.literal("delete"),
]);

export const PortForwardingEventType = z.literal("port-forwarding");

// =====================================
// Request Body
// =====================================

const CreateMappingRequestPayloadSchema = z.object({
    type: PortForwardingEventType,
    event: z.literal("create"),
    payload: z.object({
        externalPort: z.number(),
        internalPort: z.number(),
    }),
});

const DeleteMappingRequestPayloadSchema = z.object({
    type: PortForwardingEventType,
    event: z.literal("delete"),
    payload: z.object({
        externalPort: z.number(),
        internalPort: z.number(),
    }),
});

const GetAvailablePortsRequestPayloadSchema = z.object({
    type: PortForwardingEventType,
    event: z.literal("get-available-ports"),
});

const GetCurrentMappingRequestPayloadSchema = z.object({
    type: PortForwardingEventType,
    event: z.literal("get-current-mapping"),
});

// =====================================
// Response Body
// =====================================

function getErrorSchema<T>(literal: z.ZodLiteral<T>) {
    return z.object({
        type: PortForwardingEventType,
        event: literal,
        success: z.literal(false),
        error: z.string(),
    });
}

export const GetAvailablePortsResponseSchema = z.union([
    z.object({
        type: PortForwardingEventType,
        event: z.literal("get-available-ports"),
        success: z.literal(true),
        availableExternalPorts: z.array(z.number()),
    }),
    getErrorSchema(z.literal("get-available-ports")),
]);

export const GetCurrentMappingResponseSchema = z.union([
    z.object({
        type: PortForwardingEventType,
        event: z.literal("get-current-mapping"),
        success: z.literal(true),
        currentMapping: z.array(
            z.object({
                internalPort: z.number(),
                externalPort: z.number(),
            }),
        ),
    }),
    getErrorSchema(z.literal("get-current-mapping")),
]);

export const CreateMappingResponseSchema = z.union([
    z.object({
        type: PortForwardingEventType,
        event: z.literal("create"),
        success: z.literal(true),
    }),
    getErrorSchema(z.literal("get-current-mapping")),
]);

export const DeleteMappingResponseSchema = z.union([
    z.object({
        type: PortForwardingEventType,
        event: z.literal("delete"),
        success: z.literal(true),
    }),
    getErrorSchema(z.literal("get-current-mapping")),
]);

// ==========================================
// Helper
// ==========================================

class WorkspacePortForwardingManager {
    getCurrentMapping(): z.infer<typeof GetCurrentMappingRequestPayloadSchema> {
        return {
            type: "port-forwarding",
            event: "get-current-mapping",
        };
    }

    getAvailblePorts(): z.infer<typeof GetAvailablePortsRequestPayloadSchema> {
        return {
            type: "port-forwarding",
            event: "get-available-ports",
        };
    }

    create(
        internalPort: number,
        externalPort: number,
    ): z.infer<typeof CreateMappingRequestPayloadSchema> {
        return {
            type: "port-forwarding",
            event: "create",
            payload: { internalPort, externalPort },
        };
    }

    delete(
        internalPort: number,
        externalPort: number,
    ): z.infer<typeof DeleteMappingRequestPayloadSchema> {
        return {
            type: "port-forwarding",
            event: "delete",
            payload: { internalPort, externalPort },
        };
    }
}

export const portForwardingManager = new WorkspacePortForwardingManager();
