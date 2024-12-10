import { type TreeItem, type TreeItemIndex } from "react-complex-tree";
import { z } from "zod";
import { create } from "zustand";

import { type File, FileSchema } from "@/utils/workspace-file-tree";

function flatFileTree(
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
};

export const useWorkspaceFileTreeStore = create<WorkspaceFileTreeState>(function (set) {
    return {
        fileTree: null,
        flatFileTree: {},
        setFileTree(fileTree) {
            set((state) => {
                const flatTree = flatFileTree(fileTree);

                const filteredFocusedFileTreeItems = state.focusedFileTreeItems.filter(
                    (item) => Object.keys(flatTree).includes(item.index.toString()),
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
                expandedFileTreeItems: state.expandedFileTreeItems.filter(
                    (item) => item.index !== item.index,
                ),
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
    };
});
