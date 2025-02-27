import { create } from "zustand";

import { type File } from "@/utils/workspace-file-tree";

type SearchFileResult =
    | {
          file: File;
          matchScore: number;
          previewContent: string;
      }[]
    | null;

type WorkspaceSearchState = {
    isSearchingFiles: boolean;
    searchFileQueryResult: SearchFileResult;
    searchTotalResults: number;

    setIsSearchingFile: (v: boolean) => void;
    setSearchFileQueryResult: (v: SearchFileResult) => void;
    setSearchTotalResults: (v: number) => void;
};

export const useWorkspaceSearchStore = create<WorkspaceSearchState>(function (set) {
    return {
        searchTotalResults: NaN,
        isSearchingFiles: false,
        searchFileQueryResult: null,
        setIsSearchingFile(v) {
            set({ isSearchingFiles: v });
        },
        setSearchTotalResults(v) {
            set({ searchTotalResults: v });
        },
        setSearchFileQueryResult(v) {
            set({ searchFileQueryResult: v });
        },
    };
});
