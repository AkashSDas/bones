import { z } from "zod";

// ==========================================
// Schemas
// ==========================================

export type File = {
    name: string;
    absolutePath: string;
    isDirectory: boolean;
    isFile: boolean;
    isSymlink: boolean;
    extension: string | null;
    sizeInBytes: number | null;
    modifiedAt: Date | null;
    createdAt: Date | null;
    children: File[] | null;
};

export const FileSchema: z.ZodType<File> = z.lazy(function () {
    return z.object({
        name: z.string(),
        absolutePath: z.string(),
        isDirectory: z.boolean(),
        isFile: z.boolean(),
        isSymlink: z.boolean(),
        extension: z.string().nullable(),
        sizeInBytes: z.number().nullable(),
        modifiedAt: z.date().nullable(),
        createdAt: z.date().nullable(),
        children: z.array(FileSchema).nullable(),
    });
});

export const EventSchema = z.union([
    z.literal("list"),
    z.literal("create"),
    z.literal("rename"),
    z.literal("delete"),
    z.literal("move"),
    z.literal("copy"),
    z.literal("search-text-in-files"),
    z.literal("search-file"),
]);
const ListFileTreeRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("list"),
});

export const ListFileTreeResponseSchema = z.union([
    z.object({
        success: z.literal(true),
        fileTree: FileSchema,
    }),
    z.object({
        success: z.literal(false),
        error: z.string(),
    }),
]);

// ==========================================
// Helper
// ==========================================

class WorkspaceFileTreeManager {
    listFileTree(): z.infer<typeof ListFileTreeRequestSchema> {
        return {
            type: "fs",
            event: "list",
        };
    }
}

export const fileTreeManger = new WorkspaceFileTreeManager();
