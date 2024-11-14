import { z } from "npm:zod";
import { expandGlob, ensureDir, emptyDir, copy } from "jsr:@std/fs";
import { basename, extname, join, dirname } from "jsr:@std/path";
import { levenshteinDistance } from "jsr:@std/text";

const LEVENSHTEIN_DISTANCE_THRESHOLD = 3;

type File = {
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

const FileSchema: z.ZodType<File> = z.lazy(function () {
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

type SearchTextResult = {
    file: File;
    numberOfMatches: number;
    previewContent: string;
};

type SearchFileResult = {
    file: File;
    matchScore: number;
    previewContent: string;
};

class FileSystemManager {
    /** Absolute path of workspace */
    private readonly rootDir: "/usr/workspace" = "/usr/workspace";

    /** These directories will be excluded for search (text, file/directory) */
    private readonly excludedDirs: string[] = [".git", "node_modules", ".venv"];

    // ==============================================
    // List file tree in the workspace
    // ==============================================

    async listWorkspaceFileTree(): Promise<File | Error> {
        try {
            const absolutePath = await Deno.realPath(this.rootDir);
            await ensureDir(absolutePath);
            const stats = await Deno.lstat(absolutePath);

            const root = this.createFileObject(absolutePath, stats);

            if (root.isDirectory) {
                await this.populateDirectoryContent(root);
            }

            return root;
        } catch (e) {
            return new Error(`Failed to list file tree: ${e}`);
        }
    }

    private async populateDirectoryContent(directory: File): Promise<void> {
        const entries = expandGlob(join(directory.absolutePath, "*"), {
            includeDirs: true,
        });

        const childPromises: Promise<File>[] = [];

        for await (const entry of entries) {
            childPromises.push(
                // Arrow function is needed for `this` used in the async function
                // and it refers to the parent scope's `this`
                (async () => {
                    const stats = await Deno.lstat(entry.path);
                    const child = this.createFileObject(entry.path, stats);

                    // If this is a directory, populate its children recursively
                    if (child.isDirectory) {
                        await this.populateDirectoryContent(child);
                    }

                    return child;
                })()
            );
        }

        directory.children = await Promise.all(childPromises);
    }

    // ==============================================
    // Create folder or file
    // ==============================================

    async createFileOrFolder(
        name: string,
        absolutePath: string,
        isDirectory: boolean
    ): Promise<File | Error> {
        const location = join(absolutePath, name);

        try {
            if (isDirectory) {
                await ensureDir(location);
            } else {
                await Deno.writeTextFile(location, "");
            }

            const stats = await Deno.lstat(location);
            return this.createFileObject(location, stats);
        } catch (e) {
            return new Error(`Failed to create file or folder: ${e}`);
        }
    }

    // ==============================================
    // Rename file or folder
    // ==============================================

    async renameFileOrFolder(
        absolutePath: string,
        newName: string
    ): Promise<File | Error> {
        try {
            const newAbsolutePath = join(dirname(absolutePath), newName);

            const exists = await Deno.lstat(newAbsolutePath);
            if (exists) {
                return new Error(
                    `Target path ${newAbsolutePath} already exists.`
                );
            }

            await Deno.rename(absolutePath, newAbsolutePath);

            const stats = await Deno.lstat(absolutePath);
            return this.createFileObject(absolutePath, stats);
        } catch (e) {
            return new Error(`Failed to rename file or folder: ${e}`);
        }
    }

    // ==============================================
    // Delete file or folder
    // ==============================================

    async deleteFilesOrFolders(paths: string[]): Promise<void> {
        // Use arrow function so that `this` refers to the parent scope
        const deletePromises = paths.map((path) => {
            return this.deleteFileOrFolder(path);
        });

        await Promise.all(deletePromises);
    }

    private async deleteFileOrFolder(absolutePath: string): Promise<void> {
        try {
            const stats = await Deno.lstat(absolutePath);
            if (stats.isDirectory) {
                await emptyDir(absolutePath);
                await Deno.remove(absolutePath, { recursive: true });
            } else {
                await Deno.remove(absolutePath);
            }
        } catch (error) {
            console.error(`Failed to delete ${absolutePath}: ${error}`);
        }
    }

    // ==============================================
    // Move files or folders
    // ==============================================

    async moveFileOrFolder(
        absoluteSourcePath: string,
        absoluteDestinationPath: string
    ): Promise<File | Error> {
        try {
            const newAbsolutePath = join(
                dirname(absoluteDestinationPath),
                basename(absoluteSourcePath)
            );

            await Deno.rename(absoluteSourcePath, newAbsolutePath);

            const stats = await Deno.lstat(newAbsolutePath);
            return this.createFileObject(newAbsolutePath, stats);
        } catch (e) {
            return new Error(`Failed to move file or folder: ${e}`);
        }
    }

    // Checkout Deno.rename function. It also moves files/folders.
    async moveFilesOrFolders(
        absoluteSourcePaths: string[],
        absoluteDestinationPath: string
    ): Promise<(File | Error)[] | Error> {
        try {
            const destInfo = await Deno.stat(absoluteDestinationPath);
            if (!destInfo.isDirectory) {
                return new Error("Destination path is not a directory");
            }

            const movePromises = absoluteSourcePaths.map((sourcePath) => {
                return this.moveFileOrFolder(
                    sourcePath,
                    absoluteDestinationPath
                );
            });

            const files = await Promise.all(movePromises);

            return files;
        } catch (e) {
            return new Error(`Failed to move file or folder: ${e}`);
        }
    }

    // ==============================================
    // Copy paste files or folders
    // ==============================================

    async copyFileOrFolder(
        absoluteSourcePath: string,
        absoluteDestinationPath: string
    ): Promise<File | Error> {
        try {
            const baseName = basename(absoluteSourcePath);
            let destinationPath = join(absoluteDestinationPath, baseName);
            let counter = 1;

            // Check if a file/folder with the same name exists, if so, find a unique name
            while (await this.pathExists(destinationPath)) {
                destinationPath = join(
                    absoluteDestinationPath,
                    `${baseName} ${counter}`
                );
                counter++;
            }

            await copy(absoluteSourcePath, destinationPath, {
                preserveTimestamps: true,
                overwrite: true, // Shouldn't be an issue since we already checked if it exists
            });

            const stats = await Deno.lstat(destinationPath);
            return this.createFileObject(destinationPath, stats);
        } catch (e) {
            return new Error(`Failed to copy file or folder: ${e}`);
        }
    }

    async copyFilesOrFolders(
        absoluteSourcePaths: string[],
        absoluteDestinationPath: string
    ): Promise<(File | Error)[] | Error> {
        try {
            const destInfo = await Deno.stat(absoluteDestinationPath);
            if (!destInfo.isDirectory) {
                return new Error("Destination path is not a directory");
            }

            const copyPromises = absoluteSourcePaths.map((sourcePath) => {
                return this.copyFileOrFolder(
                    sourcePath,
                    absoluteDestinationPath
                );
            });

            const files = await Promise.all(copyPromises);
            return files;
        } catch (e) {
            return new Error(`Failed to copy files or folders: ${e}`);
        }
    }

    // ==============================================
    // Search text in files
    // ==============================================

    async searchTextInFiles(
        query: string,
        options: {
            matchCase: boolean;
            matchWholeWord: boolean;
            useRegex: boolean;
        }
    ): Promise<{
        results: SearchTextResult[];
        total: number;
    }> {
        const results: SearchTextResult[] = [];

        const files = (await this.flatWorkspaceFileTree()).filter((file) => {
            if (file.isDirectory) {
                return false;
            }

            const ignoreFilesInDir = this.excludedDirs.some((dir) => {
                const ignore = file.absolutePath.startsWith(
                    join(this.rootDir, dir)
                );

                return ignore;
            });

            return !ignoreFilesInDir;
        });

        for (const file of files) {
            const result = await this.searchTextInFile(query, options, file);

            if (result) {
                results.push(result);
            }
        }

        return {
            results,
            total: results.reduce(
                (acc, result) => acc + result.numberOfMatches,
                0
            ),
        };
    }

    async searchTextInFile(
        query: string,
        options: {
            matchCase: boolean;
            matchWholeWord: boolean;
            useRegex: boolean;
        },
        file: File
    ): Promise<SearchTextResult | null> {
        // Prepare the query pattern based on options

        let pattern: RegExp;

        if (options.useRegex) {
            pattern = new RegExp(query, options.matchCase ? "g" : "gi");
        } else {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape regex special characters
            const wordBoundary = options.matchWholeWord ? "\\b" : "";
            pattern = new RegExp(
                `${wordBoundary}${escapedQuery}${wordBoundary}`,
                options.matchCase ? "g" : "gi"
            );
        }

        // Read the file content

        const content = await Deno.readTextFile(file.absolutePath);
        const matches = content.match(pattern);

        if (matches) {
            const previewContent = this.previewFileContent(content, pattern);

            return {
                file,
                numberOfMatches: matches.length,
                previewContent,
            };
        }

        return null;
    }

    // ==============================================
    // Search files
    // ==============================================

    async searchFilesByName(query: string): Promise<SearchFileResult[]> {
        const files = (await this.flatWorkspaceFileTree()).filter((file) => {
            if (file.isDirectory) {
                return false;
            }

            const ignoreFilesInDir = this.excludedDirs.some((dir) => {
                const ignore = file.absolutePath.startsWith(
                    join(this.rootDir, dir)
                );

                return ignore;
            });

            return !ignoreFilesInDir;
        });

        const results: SearchFileResult[] = [];

        for (const file of files) {
            const distance = levenshteinDistance(
                file.name.toLowerCase(),
                query.toLowerCase()
            );

            if (distance < LEVENSHTEIN_DISTANCE_THRESHOLD) {
                const previewContent = await this.previewInitialContentOfFile(
                    file.absolutePath
                );

                results.push({ file, matchScore: distance, previewContent });
            }
        }

        return results.sort((a, b) => a.matchScore - b.matchScore).slice(0, 20);
    }

    // ==============================================
    // Export workspace
    // ==============================================

    async exportWorkspace(): Promise<string> {
        const src = await Deno.open(this.rootDir, { read: true });

        const dest = await Deno.open(`/usr/workspace.tar.gz`, {
            create: true,
            write: true,
        });

        await src.readable
            .pipeThrough(new CompressionStream("gzip"))
            .pipeTo(dest.writable);

        return `/usr/workspace.tar.gz`;
    }

    // ==============================================
    // Utilities
    // ==============================================

    /**
     * Generate the file object that will be used in all of the operations. `children`
     * will be empty list if it's a directory else it will be `null`. Populating
     * children is the responsibility of the caller.
     *
     * @param absolutePath
     * @param stats
     * @returns {File}
     */
    private createFileObject(absolutePath: string, stats: Deno.FileInfo): File {
        return {
            name: basename(absolutePath),
            absolutePath,
            isFile: stats.isFile,
            isDirectory: stats.isDirectory,
            isSymlink: stats.isSymlink,
            extension: extname(absolutePath) ? extname(absolutePath) : null,
            sizeInBytes: stats.size ?? null,
            modifiedAt: stats.mtime,
            createdAt: stats.birthtime,
            children: stats.isDirectory ? [] : null,
        };
    }

    private async pathExists(path: string): Promise<boolean> {
        try {
            await Deno.lstat(path);
            return true;
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                return false;
            }

            console.error(`Failed to check if path exists: ${e}`);
            return false;
        }
    }

    private async flatWorkspaceFileTree(): Promise<File[]> {
        const workspace = await this.listWorkspaceFileTree();

        if (workspace instanceof Error) {
            return [];
        }

        const filesAndFolders: File[] = [];

        traverse(workspace);

        function traverse(file: File) {
            filesAndFolders.push(file);
            if (file.isDirectory && file.children) {
                file.children.forEach(traverse);
            }
        }

        return filesAndFolders;
    }

    private previewFileContent(content: string, pattern: RegExp): string {
        const match = content.match(pattern);

        if (match && match.index !== undefined) {
            // Start preview 100 characters before match
            const startIdx = Math.max(0, match.index - 100);

            // End preview 100 characters after match
            const endIdx = Math.min(
                content.length,
                match.index + match[0].length + 100
            );

            return content.substring(startIdx, endIdx);
        }

        return content.substring(0, 200); // Default preview if no match found
    }

    private async previewInitialContentOfFile(
        absolutePath: string
    ): Promise<string> {
        try {
            const content = await Deno.readTextFile(absolutePath);
            return content.split("\n").slice(0, 20).join("\n");
        } catch (e) {
            console.error(`Error reading file ${absolutePath}:`, e);
            return "";
        }
    }
}

export const fileSystemManager = new FileSystemManager();
