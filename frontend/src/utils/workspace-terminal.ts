import { z } from "zod";

// ==========================================
// Schemas
// ==========================================

export const TerminalEventSchema = z.union([
    z.literal("getTerminals"),
    z.literal("createTerminal"),
    z.literal("deleteTerminal"),
]);

// =====================================
// Request Body
// =====================================

const _ListTerminalsRequestSchema = z.object({
    type: z.literal("terminal"),
    event: z.literal("getTerminals"),
});

const _DeleteTerminalRequestSchema = z.object({
    type: z.literal("terminal"),
    event: z.literal("deleteTerminal"),
    payload: z.string().uuid(),
});

const _CreateTerminalRequestSchema = z.object({
    type: z.literal("terminal"),
    event: z.literal("createTerminal"),
});

// =====================================
// Response Body
// =====================================

export const ListTerminalsResponseSchema = z.object({
    type: z.literal("terminal"),
    event: z.literal("getTerminals"),
    payload: z.array(z.string().uuid()),
});

export const CreateTerminalResponseSchema = z.object({
    type: z.literal("terminal"),
    event: z.literal("createTerminal"),
    payload: z.string().uuid(),
});

// ==========================================
// Helper
// ==========================================

class WorkspaceTerminalManager {
    list(): z.infer<typeof _ListTerminalsRequestSchema> {
        return {
            type: "terminal",
            event: "getTerminals",
        };
    }

    create(): z.infer<typeof _CreateTerminalRequestSchema> {
        return {
            type: "terminal",
            event: "createTerminal",
        };
    }

    delete(terminalId: string): z.infer<typeof _DeleteTerminalRequestSchema> {
        return {
            type: "terminal",
            event: "deleteTerminal",
            payload: terminalId,
        };
    }
}

export const terminalManager = new WorkspaceTerminalManager();
