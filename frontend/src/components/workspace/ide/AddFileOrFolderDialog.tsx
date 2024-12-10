import { useMemo, useState } from "react";

import { Button } from "@/components/shared/Button";
import { DialogContent, DialogFooter, DialogHeader } from "@/components/shared/Dialog";
import { Input } from "@/components/shared/Input";
import { Loader } from "@/components/shared/Loader";
import { useToast } from "@/hooks/toast";
import { useWorkspaceFileTree } from "@/hooks/workspace";
import { useWorkspaceFileTreeStore } from "@/store/workspace-file-tree";

import { FileIcon } from "./FileIcon";

export function AddFileOrFolderDialog() {
    const { addFileOrFolderInDirectory, isCreatingFileOrFolder } =
        useWorkspaceFileTreeStore();
    const [name, setName] = useState("");
    const { createFileOrFolder } = useWorkspaceFileTree();

    const { toast } = useToast();

    const isFile = useMemo(
        () => addFileOrFolderInDirectory?.type === "file",
        [addFileOrFolderInDirectory],
    );

    function addFileOrFolder() {
        if (isCreatingFileOrFolder || !addFileOrFolderInDirectory) return;
        if (name.length < 3) {
            toast({
                title: "Name is too short",
                description: "Name must be at least 3 characters long",
                variant: "error",
            });

            return;
        }

        createFileOrFolder(name, addFileOrFolderInDirectory.absolutePath, !isFile);
    }

    if (!addFileOrFolderInDirectory) return null;

    return (
        <DialogContent>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    addFileOrFolder();
                }}
            >
                <DialogHeader>Add {isFile ? "File" : "Folder"}</DialogHeader>

                <p className="text-xs text-grey-500">
                    {addFileOrFolderInDirectory.absolutePath}
                </p>

                <div className="flex items-center gap-2">
                    <span className="w-6 h-6">
                        <FileIcon
                            isDirectory={!isFile}
                            isFile={isFile}
                            filename={name}
                            height={24}
                            width={24}
                        />
                    </span>

                    <Input
                        className="!h-8 w-full"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={3}
                    />
                </div>

                <DialogFooter className="mt-4">
                    <Button type="submit">
                        {isCreatingFileOrFolder ? <Loader /> : null}
                        {!isCreatingFileOrFolder && isFile ? "Add File" : "Add Folder"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
