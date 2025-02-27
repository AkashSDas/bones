import { zodResolver } from "@hookform/resolvers/zod";
import {
    CheckIcon,
    FilePlusIcon,
    FolderPlusIcon,
    LinkIcon,
    ListCollapseIcon,
    RotateCcwIcon,
    TrashIcon,
} from "lucide-react";
import { useEffect } from "node_modules/react-resizable-panels/dist/declarations/src/vendor/react";
import { useState } from "react";
import { ControlledTreeEnvironment, Tree, TreeItemIndex } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/shared/Button";
import { Dialog, DialogTrigger } from "@/components/shared/Dialog";
import { Form, FormField } from "@/components/shared/Form";
import { Input } from "@/components/shared/Input";
import { Loader } from "@/components/shared/Loader";
import { useToast } from "@/hooks/toast";
import { useWorkspaceFileTree, useWorkspaceURL } from "@/hooks/workspace";
import { useWorkspacePane } from "@/hooks/workspace-pane";
import { useWorkspaceStore } from "@/store/workspace";
import { findParentFile, useWorkspaceFileTreeStore } from "@/store/workspace-file-tree";
import { useWorkspaceLSPStore } from "@/store/workspace-lsp";
import { cn } from "@/utils/styles";
import { getEditorLanguage } from "@/utils/workspace-editor";
import { type File } from "@/utils/workspace-file-tree";
import {
    LanguageLSPMapping,
    initLSPWebsocketAndStartLanguageClient,
} from "@/utils/workspace-lsp";

import { AddFileOrFolderDialog } from "./AddFileOrFolderDialog";
import { FileIcon } from "./FileIcon";

const TREE_ID = "file-tree";

const RenameFormSchema = z.object({
    name: z.string(),
});

export function FileTree() {
    const {
        flatFileTree,
        fileTree,
        isFetching,
        focusedFileTreeItems,
        expandedFileTreeItems,
        selectedFileTreeItems,
        setCollapsedFileTreeItems,
        setExpandedFileTreeItems,
        setFocusedFileTreeItems,
        setSelectedFileTreeItems,
        setAddFileOrFolderInDirectory,
        addFileOrFolderInDirectory,
        setCollapsedFileTreeAllItems,
        isDeletingFilesOrFolders,
        copyFileOrFolder,
        moveFileOrFolder,
    } = useWorkspaceFileTreeStore();
    const { getFileTree, deleteFilesOrFolders, getFile } = useWorkspaceFileTree();
    const { contextWindow } = useWorkspaceStore();
    const { addTab } = useWorkspacePane();
    const { initializedLSPs, installedLSPs } = useWorkspaceLSPStore();
    const { bridgeWsURL } = useWorkspaceURL();
    const { toast } = useToast();

    /** List of absolute paths */
    const [copiedItems, setCopiedItems] = useState<TreeItemIndex[]>([]);

    useEffect(
        function addFileTreeKeyBindings() {
            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };

            function handleKeyDown(e: KeyboardEvent) {
                // On copy
                if ((e.ctrlKey || e.metaKey) && e.key === "c") {
                    if (selectedFileTreeItems.length > 0) {
                        setCopiedItems(selectedFileTreeItems);
                    }
                }

                // On paste
                if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                    if (copiedItems.length > 0 && selectedFileTreeItems.length === 1) {
                        const selectedItemIdx = selectedFileTreeItems[0];
                        const destFile = flatFileTree[selectedItemIdx];

                        if (destFile) {
                            let destPath = destFile.data.absolutePath;

                            if (destFile.data.isFile) {
                                const parts = destPath.split("/");
                                parts.pop();
                                destPath = parts.join("/"); // Parent dir path
                            }

                            copyFileOrFolder(
                                copiedItems.map((f) => f.toString()),
                                destPath,
                            );

                            setCopiedItems([]); // Clear the copied items state after pasting
                        }
                    }
                }

                // Clear copied items on escape key press
                if (e.key === "Escape") {
                    setCopiedItems([]);
                }
            }
        },
        [copiedItems, selectedFileTreeItems, flatFileTree, copyFileOrFolder],
    );

    if (!fileTree) {
        return (
            <div
                className={cn(
                    "no-scrollbar h-full overflow-y-auto overflow-x-hidden border-r border-r-grey-900 !pb-12 group my-4",
                    contextWindow === "files" ? "block" : "hidden",
                )}
            >
                <div className="px-4 flex items-center gap-4">
                    <Loader sizeInPx={16} />
                    <span className="text-grey-400 text-sm">Loading file tree</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "no-scrollbar h-full overflow-y-auto overflow-x-hidden border-r border-r-grey-900 !pb-12 group",
                contextWindow === "files" ? "block" : "hidden",
            )}
        >
            <div className="flex gap-[2px] mb-2 mt-2 px-2 items-center">
                <span className="w-full text-sm tracking-wide uppercase text-grey-300">
                    Workspace
                </span>

                <span className="opacity-0 group-hover:opacity-100 flex items-center gap-[2px]">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="!h-7 !w-7"
                        disabled={isFetching}
                        onClick={getFileTree}
                    >
                        {isFetching ? (
                            <Loader />
                        ) : (
                            <RotateCcwIcon className="stroke-grey-300" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="!h-7 !w-7"
                        disabled={
                            isFetching ||
                            isDeletingFilesOrFolders ||
                            selectedFileTreeItems.length === 0
                        }
                        onClick={() => {
                            if (selectedFileTreeItems.length > 0) {
                                deleteFilesOrFolders(
                                    selectedFileTreeItems.map(
                                        (item) => flatFileTree[item].data.absolutePath,
                                    ),
                                );
                            }
                        }}
                    >
                        {isDeletingFilesOrFolders ? (
                            <Loader />
                        ) : (
                            <TrashIcon className="stroke-grey-300" />
                        )}
                    </Button>

                    <Dialog
                        open={addFileOrFolderInDirectory?.type === "file"}
                        onOpenChange={(open) => {
                            if (!open) {
                                setAddFileOrFolderInDirectory(null);
                            }
                        }}
                    >
                        <AddFileOrFolderDialog />
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="!h-7 !w-7"
                                disabled={isFetching}
                                onClick={function addFile() {
                                    // Get the selected files/folders

                                    const selectedItems: File[] = [];
                                    for (const selected of selectedFileTreeItems) {
                                        selectedItems.push(flatFileTree[selected].data);
                                    }

                                    // Get the last selected folder (if exists)

                                    let lastSelectedDirectory: null | string = null;
                                    let lastSelectedFile: null | string = null;
                                    for (const selected of selectedItems) {
                                        if (selected.isDirectory) {
                                            lastSelectedDirectory =
                                                selected.absolutePath;
                                        } else {
                                            lastSelectedFile = selected.absolutePath;
                                        }
                                    }

                                    // Get parent folder in which the folder will be added

                                    let parentAbsolutePath = fileTree.absolutePath;
                                    if (lastSelectedDirectory) {
                                        parentAbsolutePath = lastSelectedDirectory;
                                    } else if (lastSelectedFile) {
                                        parentAbsolutePath =
                                            findParentFile(fileTree, lastSelectedFile)
                                                ?.absolutePath ?? fileTree.absolutePath;
                                    }

                                    setAddFileOrFolderInDirectory({
                                        type: "file",
                                        absolutePath: parentAbsolutePath,
                                    });
                                }}
                            >
                                <FilePlusIcon className="stroke-grey-300" />
                            </Button>
                        </DialogTrigger>
                    </Dialog>

                    <Dialog
                        open={addFileOrFolderInDirectory?.type === "folder"}
                        onOpenChange={(open) => {
                            if (!open) {
                                setAddFileOrFolderInDirectory(null);
                            }
                        }}
                    >
                        <AddFileOrFolderDialog />
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="!h-7 !w-7"
                                disabled={isFetching}
                                onClick={function addFolder() {
                                    // Get the selected files/folders

                                    const selectedItems: File[] = [];
                                    for (const selected of selectedFileTreeItems) {
                                        selectedItems.push(flatFileTree[selected].data);
                                    }

                                    // Get the last selected folder (if exists)

                                    let lastSelectedDirectory: null | string = null;
                                    let lastSelectedFile: null | string = null;
                                    for (const selected of selectedItems) {
                                        if (selected.isDirectory) {
                                            lastSelectedDirectory =
                                                selected.absolutePath;
                                        } else {
                                            lastSelectedFile = selected.absolutePath;
                                        }
                                    }

                                    // Get parent folder in which the folder will be added

                                    let parentAbsolutePath = fileTree.absolutePath;
                                    if (lastSelectedDirectory) {
                                        parentAbsolutePath = lastSelectedDirectory;
                                    } else if (lastSelectedFile) {
                                        parentAbsolutePath =
                                            findParentFile(fileTree, lastSelectedFile)
                                                ?.absolutePath ?? fileTree.absolutePath;
                                    }

                                    setAddFileOrFolderInDirectory({
                                        type: "folder",
                                        absolutePath: parentAbsolutePath,
                                    });
                                }}
                            >
                                <FolderPlusIcon className="stroke-grey-300" />
                            </Button>
                        </DialogTrigger>
                    </Dialog>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="!h-7 !w-7"
                        disabled={isFetching}
                        onClick={() =>
                            setCollapsedFileTreeAllItems(expandedFileTreeItems)
                        }
                    >
                        <ListCollapseIcon className="stroke-grey-300" />
                    </Button>
                </span>
            </div>

            <ControlledTreeEnvironment<File>
                items={flatFileTree}
                getItemTitle={(item) => item.data.name}
                viewState={{
                    [TREE_ID]: {
                        focusedItem: focusedFileTreeItems.map((item) => item.index)[0],
                        expandedItems: expandedFileTreeItems.map((item) => item.index),
                        selectedItems: selectedFileTreeItems,
                    },
                }}
                canReorderItems={false}
                canRename
                canDragAndDrop
                canDropOnFolder
                canDropOnNonFolder
                renderDragBetweenLine={function () {
                    return <div className="w-full h-[1px] bg-brand-500" />;
                }}
                onDrop={function (items, target) {
                    const destFile = flatFileTree[target.treeId];
                    if (destFile) {
                        let destPath = destFile.data.absolutePath;

                        if (destFile.data.isFile) {
                            const parts = destPath.split("/");
                            parts.pop();
                            destPath = parts.join("/"); // Parent dir path

                            moveFileOrFolder(
                                items.map((f) => f.data.absolutePath),
                                destPath,
                            );
                        }
                    }
                }}
                renderRenameInput={function (props) {
                    const { item } = props;

                    const form = useForm<z.infer<typeof RenameFormSchema>>({
                        resolver: zodResolver(RenameFormSchema),
                        defaultValues: { name: item.data.name },
                    });

                    async function onSubmit(values: z.infer<typeof RenameFormSchema>) {
                        console.log({ values });
                    }

                    return (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex items-center gap-[1px] z-10 absolute"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <Input
                                            placeholder="Enter name"
                                            type="text"
                                            minLength={3}
                                            maxLength={255}
                                            required
                                            {...field}
                                            className="text-sm"
                                            style={{ height: "28px" }}
                                        />
                                    )}
                                />

                                <Button
                                    size="icon"
                                    style={{ height: "28px", width: "28px" }}
                                >
                                    <CheckIcon size="16px" />
                                </Button>
                            </form>
                        </Form>
                    );
                }}
                onFocusItem={setFocusedFileTreeItems}
                onExpandItem={setExpandedFileTreeItems}
                onCollapseItem={setCollapsedFileTreeItems}
                onSelectItems={setSelectedFileTreeItems}
                onPrimaryAction={(item) => {
                    if (item.data.isFile) {
                        addTab({ file: item.data, type: "codeFile" });
                        getFile(item.data.absolutePath);

                        const language = getEditorLanguage(item.data.name);
                        const lsp = LanguageLSPMapping[language];

                        if (lsp) {
                            if (!installedLSPs.includes(lsp)) {
                                toast({
                                    title: "LSP not installed",
                                    description: `Please install ${lsp}`,
                                    variant: "default",
                                });
                            } else if (!initializedLSPs.includes(lsp)) {
                                console.log(`Initializing ${lsp}`);
                                initLSPWebsocketAndStartLanguageClient(
                                    `${bridgeWsURL}/lsp/${lsp}`,
                                    language,
                                    lsp,
                                );
                            }
                        }
                    } else if (item.data.isSymlink) {
                        toast({
                            title: "Cannot open symlink",
                            description: "The symlink is not supported yet",
                            variant: "error",
                        });
                    }
                }}
                renderItemTitle={({ title, item, context }) => {
                    return (
                        <span
                            className={cn(
                                "flex items-center gap-2",
                                item.data.isSymlink ? "opacity-50" : null,
                            )}
                        >
                            <span className="relative">
                                <FileIcon
                                    filename={item.data.name}
                                    isDirectory={item.data.isDirectory}
                                    isFile={!item.data.isDirectory}
                                    isOpen={context.isExpanded}
                                    height={20}
                                    width={20}
                                />

                                {item.data.isSymlink ? (
                                    <span>
                                        <LinkIcon
                                            size={12}
                                            className="absolute bottom-0 right-0 stroke-grey-300"
                                        />
                                    </span>
                                ) : null}
                            </span>

                            <span className="overflow-hidden whitespace-nowrap text-nowrap text-ellipsis">
                                {title}
                            </span>
                        </span>
                    );
                }}
            >
                <Tree
                    treeId={TREE_ID}
                    rootItem={fileTree.absolutePath}
                    treeLabel="Workspace File Tree"
                />
            </ControlledTreeEnvironment>
        </div>
    );
}
