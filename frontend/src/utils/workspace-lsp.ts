import { z } from "zod";

// ==========================================
// Schemas
// ==========================================

export const LSPEventSchema = z.literal("install");

const SupportedLanguageSchema = z.union([
    z.literal("go"),
    z.literal("python"),
    z.literal("typescript"),
    z.literal("json"),
    z.literal("html"),
    z.literal("toml"),
    z.literal("css"),
    z.literal("rust"),
]);

const SupportedLSPSchema = z.union([
    z.literal("gopls"),
    z.literal("pyrightLangserver"),
    z.literal("typescriptLanguageServer"),
    z.literal("jsonLanguageServer"),
    z.literal("cssLanguageServer"),
    z.literal("htmlLanguageServer"),
    z.literal("tomlLanguageServer"),
    z.literal("rustLanguageServer"),
]);

// =====================================
// Request Body
// =====================================

const ListLSPsRequestSchema = z.object({
    type: z.literal("lsp"),
    event: z.literal("list"),
});

const InstallLSPRequestSchema = z.object({
    type: z.literal("lsp"),
    event: z.literal("install"),
    payload: z.object({
        language: SupportedLanguageSchema,
        lsp: SupportedLSPSchema,
    }),
});

// =====================================
// Response Body
// =====================================

function getErrorSchema<T>(literal: z.ZodLiteral<T>) {
    return z.object({
        type: z.literal("lsp"),
        event: literal,
        success: z.literal(false),
        error: z.string(),
    });
}

export const ListLSsPResponseSchema = z.union([
    z.object({
        type: z.literal("lsp"),
        event: z.literal("list"),
        success: z.literal(true),
        languageServers: z.array(
            z.object({
                serverName: z.string(),
                extension: z.string(),
                installationPrerequisite: z.array(
                    z.object({
                        toolName: z.string(),
                        description: z.string(),
                        exampleInstallCommand: z.string().optional(),
                    }),
                ),
            }),
        ),
    }),
    getErrorSchema(z.literal("list")),
]);

export const InstallLSPResponseSchema = z.union([
    z.object({
        type: z.literal("lsp"),
        event: z.literal("install"),
        success: z.literal(true),
        message: z.string(),
    }),
    getErrorSchema(z.literal("install")),
]);

// ==========================================
// Helper
// ==========================================

class WorkspaceLSPManager {
    list(): z.infer<typeof ListLSPsRequestSchema> {
        return {
            type: "lsp",
            event: "list",
        };
    }

    install(
        language: z.infer<typeof SupportedLanguageSchema>,
        lsp: z.infer<typeof SupportedLSPSchema>,
    ): z.infer<typeof InstallLSPRequestSchema> {
        return {
            type: "lsp",
            event: "install",
            payload: {
                language,
                lsp,
            },
        };
    }
}

export const lspManger = new WorkspaceLSPManager();
