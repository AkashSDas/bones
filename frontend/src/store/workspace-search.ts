import { create } from "zustand";

import { type File } from "@/utils/workspace-file-tree";

type SearchFileResult =
    | {
          file: File;
          matchScore: number;
          previewContent: string;
      }[]
    | null;

type SearchTextInFileResult =
    | {
          file: File;
          numberOfMatches: number;
          previewContent: string;
      }[]
    | null;

type WorkspaceSearchState = {
    isSearchingFiles: boolean;
    searchFileQueryResult: SearchFileResult;

    setIsSearchingFile: (v: boolean) => void;
    setSearchFileQueryResult: (v: SearchFileResult) => void;

    isSearchingTextInFiles: boolean;
    searchTextInFileQueryResult: SearchTextInFileResult;
    searchTextInFileTotalResults: number;

    setIsSearchingTextInFile: (v: boolean) => void;
    setSearchTextInFileQueryResult: (v: SearchTextInFileResult) => void;
    setSearchTextInFileTotalResults: (v: number) => void;
};

export const useWorkspaceSearchStore = create<WorkspaceSearchState>(function (set) {
    return {
        isSearchingFiles: false,
        searchFileQueryResult: null,
        setIsSearchingFile(v) {
            set({ isSearchingFiles: v });
        },
        setSearchFileQueryResult(v) {
            set({ searchFileQueryResult: v });
        },

        searchTextInFileTotalResults: NaN,
        isSearchingTextInFiles: false,
        searchTextInFileQueryResult: null,
        setIsSearchingTextInFile(v) {
            set({ isSearchingTextInFiles: v });
        },
        setSearchTextInFileTotalResults(v) {
            set({ searchTextInFileTotalResults: v });
        },
        setSearchTextInFileQueryResult(v) {
            set({ searchTextInFileQueryResult: v });
        },
    };
});
