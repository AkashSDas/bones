import { type TreeItem, type TreeItemIndex } from "react-complex-tree";
import { z } from "zod";
import { create } from "zustand";

import { type File, FileSchema } from "@/utils/workspace-file-tree";

function createFlatFileTree(
    workspaceFileTree: File | null,
): Record<TreeItemIndex, TreeItem<File>> {
    const tree: Record<TreeItemIndex, TreeItem<File>> = {};

    if (workspaceFileTree === null) {
        return tree;
    }

    const flattenTree = (node: File): void => {
        const { absolutePath, isDirectory, children } = node;

        const sortedChildren = children
            ? children.sort((a, b) => {
                  if (a.isDirectory && !b.isDirectory) return -1; // Folders first
                  if (!a.isDirectory && b.isDirectory) return 1; // Files after
                  return a.name.localeCompare(b.name); // Alphabetical order
              })
            : [];

        tree[absolutePath] = {
            index: node.absolutePath,
            data: node,
            children: isDirectory
                ? sortedChildren.map((child) => child.absolutePath)
                : [],
            isFolder: node.isDirectory,
            canMove: true,
            canRename: true,
        };

        if (children && Array.isArray(children)) {
            children.forEach((child) => flattenTree(child));
        }
    };

    flattenTree(workspaceFileTree);

    return tree;
}

export function findParentFile(tree: File, targetAbsolutePath: string): File | null {
    if (!tree.children || tree.children.length === 0) {
        return null;
    }

    for (const child of tree.children) {
        if (child.absolutePath === targetAbsolutePath) {
            return tree;
        }
    }

    for (const child of tree.children) {
        const parent = findParentFile(child, targetAbsolutePath);
        if (parent) {
            return parent;
        }
    }

    return null;
}

function getFileNameFromPath(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 1];
}

type WorkspaceFileTreeState = {
    fileTree: z.infer<typeof FileSchema> | null;
    flatFileTree: Record<string, TreeItem<File>>;
    setFileTree: (fileTree: z.infer<typeof FileSchema> | null) => void;

    isDeletingFilesOrFolders: boolean;
    setIsDeletingFilesOrFolders: (v: boolean) => void;

    isCreatingFileOrFolder: boolean;
    setIsCreatingFileOrFolder: (v: boolean) => void;
    addFileOrFolderInDirectory: {
        type: "file" | "folder";
        absolutePath: string;
    } | null;
    setAddFileOrFolderInDirectory: (
        v: {
            type: "file" | "folder";
            absolutePath: string;
        } | null,
    ) => void;

    focusedFileTreeItems: TreeItem<File>[];
    expandedFileTreeItems: TreeItem<File>[];
    selectedFileTreeItems: TreeItemIndex[];

    setFocusedFileTreeItems: (items: TreeItem<File>) => void;
    setExpandedFileTreeItems: (items: TreeItem<File>) => void;
    setCollapsedFileTreeItems: (items: TreeItem<File>) => void;
    setCollapsedFileTreeAllItems: (items: TreeItem<File>[]) => void;
    setSelectedFileTreeItems: (items: TreeItemIndex[]) => void;

    isFetching: boolean;
    setIsFetching: (v: boolean) => void;

    moveFileOrFolder: (
        absoluteSourcePaths: string[],
        absoluteDestinationPath: string,
    ) => void;
    copyFileOrFolder: (
        absoluteSourcePaths: string[],
        absoluteDestinationPath: string,
    ) => void;
};

export const useWorkspaceFileTreeStore = create<WorkspaceFileTreeState>(
    function (set, get) {
        return {
            fileTree: null,
            flatFileTree: {},
            setFileTree(fileTree) {
                set((state) => {
                    const flatTree = createFlatFileTree(fileTree);

                    const filteredFocusedFileTreeItems =
                        state.focusedFileTreeItems.filter((item) =>
                            Object.keys(flatTree).includes(item.index.toString()),
                        );
                    const filteredExpandedFileTreeItems =
                        state.expandedFileTreeItems.filter((item) =>
                            Object.keys(flatTree).includes(item.index.toString()),
                        );
                    const filteredSelectedFileTreeItems =
                        state.selectedFileTreeItems.filter((item) =>
                            Object.keys(flatTree).includes(item.toString()),
                        );

                    return {
                        fileTree,
                        flatFileTree: flatTree,
                        focusedFileTreeItems: filteredFocusedFileTreeItems,
                        expandedFileTreeItems: filteredExpandedFileTreeItems,
                        selectedFileTreeItems: filteredSelectedFileTreeItems,
                    };
                });
            },

            isDeletingFilesOrFolders: false,
            setIsDeletingFilesOrFolders(v) {
                set((_state) => {
                    return { isDeletingFilesOrFolders: v };
                });
            },

            isCreatingFileOrFolder: false,
            setIsCreatingFileOrFolder(v) {
                set((_state) => {
                    return { isCreatingFileOrFolder: v };
                });
            },
            addFileOrFolderInDirectory: null,
            setAddFileOrFolderInDirectory(v) {
                set((_state) => {
                    return {
                        addFileOrFolderInDirectory: v,
                    };
                });
            },

            focusedFileTreeItems: [],
            expandedFileTreeItems: [],
            selectedFileTreeItems: [],

            setFocusedFileTreeItems(item) {
                set((state) => ({
                    focusedFileTreeItems: [...state.focusedFileTreeItems, item],
                }));
            },
            setExpandedFileTreeItems(item) {
                set((state) => ({
                    expandedFileTreeItems: [...state.expandedFileTreeItems, item],
                }));
            },
            setCollapsedFileTreeItems(item) {
                set((state) => ({
                    expandedFileTreeItems: state.expandedFileTreeItems.filter((i) => {
                        return !i.data.absolutePath.startsWith(item.data.absolutePath);
                    }),
                }));
            },
            setCollapsedFileTreeAllItems(items) {
                set((state) => ({
                    expandedFileTreeItems: state.expandedFileTreeItems.filter(
                        (item) => !items.map((item) => item.index).includes(item.index),
                    ),
                }));
            },
            setSelectedFileTreeItems(items) {
                set((_state) => ({ selectedFileTreeItems: items }));
            },

            isFetching: false,
            setIsFetching(v) {
                set((_state) => ({ isFetching: v }));
            },

            moveFileOrFolder(
                absoluteSourcePaths: string[],
                absoluteDestinationPath: string,
            ) {
                const { fileTree } = get();
                if (!fileTree) return;

                const updatedTree = JSON.parse(JSON.stringify(fileTree));

                absoluteSourcePaths.forEach((sourcePath) => {
                    if (hasChildWithSameName(absoluteDestinationPath, sourcePath)) {
                        console.log(
                            `Skipping move: Destination already contains an item with the same name.`,
                        );
                        return;
                    }

                    moveItem(updatedTree, sourcePath, absoluteDestinationPath);
                });

                const updatedFlatFileTree = createFlatFileTree(updatedTree);

                set({
                    fileTree: updatedTree,
                    flatFileTree: updatedFlatFileTree,
                });

                function moveItem(tree: File, srcPath: string, destPath: string): File {
                    if (!fileTree) return tree;

                    if (tree.absolutePath === srcPath) {
                        const srcParent = findParentFile(fileTree, srcPath);
                        const destParent = findParentFile(fileTree, destPath);

                        if (!srcParent || !srcParent.children) return tree;
                        if (!destParent || !destParent.children) return tree;

                        srcParent.children = srcParent.children.filter(
                            (f) => f.absolutePath !== srcPath,
                        );

                        destParent.children.push(tree);

                        return tree;
                    }

                    if (tree.children) {
                        tree.children = tree.children.map((f) =>
                            moveItem(f, srcPath, destPath),
                        );
                    }

                    return tree;
                }

                function hasChildWithSameName(
                    destPath: string,
                    srcPath: string,
                ): boolean {
                    if (!fileTree) return false;

                    const srcName = getFileNameFromPath(srcPath);
                    const destParent = findParentFile(fileTree, destPath);

                    if (destParent && destParent.children) {
                        return destParent.children.some(
                            (child) =>
                                getFileNameFromPath(child.absolutePath) === srcName,
                        );
                    }

                    return false;
                }
            },

            copyFileOrFolder(
                absoluteSourcePaths: string[],
                absoluteDestinationPath: string,
            ) {
                const { fileTree } = get();
                if (!fileTree) return;

                const updatedTree = JSON.parse(JSON.stringify(fileTree));

                absoluteSourcePaths.forEach((sourcePath) => {
                    if (hasChildWithSameName(absoluteDestinationPath, sourcePath)) {
                        console.log(
                            `Skipping copy: Destination already contains an item with the same name.`,
                        );
                        return;
                    }

                    copyItem(updatedTree, sourcePath, absoluteDestinationPath);
                });

                const updatedFlatFileTree = createFlatFileTree(updatedTree);

                set({
                    fileTree: updatedTree,
                    flatFileTree: updatedFlatFileTree,
                });

                function copyItem(tree: File, srcPath: string, destPath: string): File {
                    if (!fileTree) return tree;

                    if (tree.absolutePath === srcPath) {
                        const srcParent = findParentFile(fileTree, srcPath);
                        const destParent = findParentFile(fileTree, destPath);

                        if (!srcParent || !srcParent.children) return tree;
                        if (!destParent || !destParent.children) return tree;

                        destParent.children.push(tree);

                        return tree;
                    }

                    if (tree.children) {
                        tree.children = tree.children.map((f) =>
                            copyItem(f, srcPath, destPath),
                        );
                    }

                    return tree;
                }

                function hasChildWithSameName(
                    destPath: string,
                    srcPath: string,
                ): boolean {
                    if (!fileTree) return false;

                    const srcName = getFileNameFromPath(srcPath);
                    const destParent = findParentFile(fileTree, destPath);

                    if (destParent && destParent.children) {
                        return destParent.children.some(
                            (child) =>
                                getFileNameFromPath(child.absolutePath) === srcName,
                        );
                    }

                    return false;
                }
            },
        };
    },
);
