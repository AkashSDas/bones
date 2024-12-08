import { useMemo } from "react";
import {
    StaticTreeDataProvider,
    Tree,
    TreeItem,
    TreeItemIndex,
    UncontrolledTreeEnvironment,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";

import { useWorkspaceFileTreeStore } from "@/store/workspace-file-tree";
import { type File } from "@/utils/workspace-file-tree";

import { FileIcon } from "./FileIcon";

function flatFileTree(workspaceFileTree: File): Record<TreeItemIndex, TreeItem<File>> {
    const tree: Record<TreeItemIndex, TreeItem<File>> = {};

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

export function FileTree() {
    const { fileTree } = useWorkspaceFileTreeStore();
    const flatTree = useMemo(() => {
        if (!fileTree) {
            return {};
        } else return flatFileTree(fileTree);
    }, [fileTree]);

    console.log({ fileTree });

    if (!fileTree) return null;

    return (
        <UncontrolledTreeEnvironment<File>
            dataProvider={new StaticTreeDataProvider(flatTree)}
            getItemTitle={(item) => item.data.name}
            viewState={{}}
            canReorderItems={false}
            canDrag={() => false}
            canDragAndDrop
            canDropOnFolder
            renderItemTitle={({ title, item, context }) => {
                return (
                    <span className="flex items-center gap-2">
                        <FileIcon
                            filename={item.data.name}
                            isDirectory={item.data.isDirectory}
                            isFile={!item.data.isDirectory}
                            isOpen={context.isExpanded}
                            height={18}
                            width={18}
                        />
                        <span className="overflow-hidden whitespace-nowrap text-nowrap text-ellipsis">
                            {title}
                        </span>
                    </span>
                );
            }}
        >
            <Tree
                treeId="file-tree"
                rootItem={fileTree.absolutePath} // Matches the ID assigned to the root in `flatFileTree`
                treeLabel="Workspace File Tree"
            />
        </UncontrolledTreeEnvironment>
    );
}
