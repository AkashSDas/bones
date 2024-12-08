import { z } from "zod";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { FileSchema } from "@/utils/workspace-file-tree";

type WorkspaceFileTreeState = {
    fileTree: z.infer<typeof FileSchema> | null;
    setFileTree: (fileTree: z.infer<typeof FileSchema> | null) => void;
};

export const useWorkspaceFileTreeStore = create<WorkspaceFileTreeState>()(
    devtools(function (set) {
        return {
            fileTree: null,
            setFileTree(fileTree) {
                set((_state) => ({ fileTree }));
            },
        };
    }),
);
