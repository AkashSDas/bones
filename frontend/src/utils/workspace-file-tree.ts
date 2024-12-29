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
        modifiedAt: z
            .string()
            .nullable()
            .transform((v): Date | null =>
                v ? new Date(v) : null,
            ) as z.ZodType<Date | null>,
        createdAt: z
            .string()
            .nullable()
            .transform((v): Date | null =>
                v ? new Date(v) : null,
            ) as z.ZodType<Date | null>,
        children: z.array(FileSchema).nullable(),
    });
});

export const FileTreeEventSchema = z.union([
    z.literal("get-file"),
    z.literal("list"),
    z.literal("create"),
    z.literal("rename"),
    z.literal("delete"),
    z.literal("move"),
    z.literal("copy"),
    z.literal("search-text-in-files"),
    z.literal("search-file"),
]);

// =====================================
// Request Body
// =====================================

const GetFileRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("get-file"),
    payload: z.object({
        absolutePath: z.string(),
    }),
});

const ListFileTreeRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("list"),
});

const CreateFileOrFolderRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("create"),
    payload: z.object({
        name: z.string(),
        absolutePath: z.string(),
        isDirectory: z.boolean(),
    }),
});

const RenameFileOrFolderRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("rename"),
    payload: z.object({
        name: z.string(),
        absolutePath: z.string(),
    }),
});

const DeleteFilesOrFoldersRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("delete"),
    payload: z.object({
        absolutePaths: z.array(z.string()).min(1),
    }),
});

const MoveFilesOrFoldersRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("move"),
    payload: z.object({
        absoluteSourcePaths: z.array(z.string()).min(1),
        absoluteDestinationPath: z.string(),
    }),
});

const CopyFilesOrFoldersRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("copy"),
    payload: z.object({
        absoluteSourcePaths: z.array(z.string()).min(1),
        absoluteDestinationPath: z.string(),
    }),
});

const SearchTextInFilesRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("search-text-in-files"),
    payload: z.object({
        query: z.string().min(3),
        matchCase: z.boolean(),
        matchWholeWord: z.boolean(),
        useRegex: z.boolean(),
    }),
});

const SearchFileRequestSchema = z.object({
    type: z.literal("fs"),
    event: z.literal("search-file"),
    payload: z.object({
        query: z.string().min(3),
    }),
});

// =====================================
// Response Body
// =====================================

function getErrorSchema<T>(literal: z.ZodLiteral<T>) {
    return z.object({
        type: z.literal("fs"),
        event: literal,
        success: z.literal(false),
        error: z.string(),
    });
}

export const GetFileResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("get-file"),
        success: z.literal(true),
        file: FileSchema,
        content: z.string(),
    }),
    getErrorSchema(z.literal("get")),
]);

export const ListFileTreeResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("list"),
        success: z.literal(true),
        fileTree: FileSchema,
    }),
    getErrorSchema(z.literal("list")),
]);

export const CreateFileOrFolderResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("create"),
        success: z.literal(true),
        newFileOrFolder: FileSchema,
    }),
    getErrorSchema(z.literal("create")),
]);

export const RenameFileOrFolderResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("rename"),
        success: z.literal(true),
        newFileOrFolder: FileSchema,
    }),
    getErrorSchema(z.literal("rename")),
]);

export const DeleteFilesOrFoldersResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("delete"),
        success: z.literal(true),
    }),
    getErrorSchema(z.literal("delete")),
]);

export const MoveFilesOrFoldersResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("move"),
        success: z.literal(true),
        movedFilesOrFolders: z.union([z.string(), FileSchema]),
    }),
    getErrorSchema(z.literal("move")),
]);

export const CopyFilesOrFoldersResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("copy"),
        success: z.literal(true),
        copiedFilesOrFolders: z.union([z.string(), FileSchema]),
    }),
    getErrorSchema(z.literal("copy")),
]);

export const SearchTextInFilesResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("search-text-in-files"),
        success: z.literal(true),
        total: z.number().int(),
        results: z.object({
            file: FileSchema,
            numberOfMatches: z.number().int(),
            previewContent: z.string(),
        }),
    }),
    getErrorSchema(z.literal("search-text-in-files")),
]);

export const SearchFileResponseSchema = z.union([
    z.object({
        type: z.literal("fs"),
        event: z.literal("search-file"),
        success: z.literal(true),
        total: z.number().int(),
        results: z.object({
            file: FileSchema,
            matchScore: z.number(),
            previewContent: z.string(),
        }),
    }),
    getErrorSchema(z.literal("search-file")),
]);

// ==========================================
// Helper
// ==========================================

class WorkspaceFileTreeManager {
    getFileRequest(absolutePath: string): z.infer<typeof GetFileRequestSchema> {
        return {
            type: "fs",
            event: "get-file",
            payload: {
                absolutePath,
            },
        };
    }

    listFileTreeRequest(): z.infer<typeof ListFileTreeRequestSchema> {
        return {
            type: "fs",
            event: "list",
        };
    }

    createFileOrFolderRequest(
        name: string,
        absolutePath: string,
        isDirectory: boolean,
    ): z.infer<typeof CreateFileOrFolderRequestSchema> {
        return {
            type: "fs",
            event: "create",
            payload: {
                name,
                absolutePath,
                isDirectory,
            },
        };
    }

    renameFileOrFolderRequest(
        newName: string,
        absolutePath: string,
    ): z.infer<typeof RenameFileOrFolderRequestSchema> {
        return {
            type: "fs",
            event: "rename",
            payload: {
                name: newName,
                absolutePath,
            },
        };
    }

    deleteFilesOrFoldersRequest(
        absolutePaths: string[],
    ): z.infer<typeof DeleteFilesOrFoldersRequestSchema> {
        return {
            type: "fs",
            event: "delete",
            payload: {
                absolutePaths,
            },
        };
    }

    moveFilesOrFoldersRequest(
        absoluteSourcePaths: string[],
        absoluteDestinationPath: string,
    ): z.infer<typeof MoveFilesOrFoldersRequestSchema> {
        return {
            type: "fs",
            event: "move",
            payload: {
                absoluteSourcePaths,
                absoluteDestinationPath,
            },
        };
    }

    copyFilesOrFoldersRequest(
        absoluteSourcePaths: string[],
        absoluteDestinationPath: string,
    ): z.infer<typeof CopyFilesOrFoldersRequestSchema> {
        return {
            type: "fs",
            event: "copy",
            payload: {
                absoluteSourcePaths,
                absoluteDestinationPath,
            },
        };
    }

    searchTextInFilesRequest(
        searchText: string,
        matchCase: boolean,
        matchWholeWord: boolean,
        useRegex: boolean,
    ): z.infer<typeof SearchTextInFilesRequestSchema> {
        return {
            type: "fs",
            event: "search-text-in-files",
            payload: {
                query: searchText,
                matchCase,
                matchWholeWord,
                useRegex,
            },
        };
    }

    searchFileRequest(searchText: string): z.infer<typeof SearchFileRequestSchema> {
        return {
            type: "fs",
            event: "search-file",
            payload: {
                query: searchText,
            },
        };
    }
}

export const fileTreeManger = new WorkspaceFileTreeManager();
