import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { SupportedLSP } from "@/utils/workspace-lsp";

type AvailableLSP = {
    lspName: string;
    lspReadableName: string;
    extension: string;
    installationPrerequisite: {
        toolName: string;
        description: string;
        exampleInstallCommand?: string;
    }[];
};

type WorkspaceLSPState = {
    availableLSPs: AvailableLSP[];
    setAvailableLSPs: (v: AvailableLSP[]) => void;

    installedLSPs: SupportedLSP[];
    setInstalledLSPs: (v: SupportedLSP[]) => void;

    initializedLSPs: SupportedLSP[];
    setInitializedLSPs: (v: SupportedLSP[]) => void;
};

export const useWorkspaceLSPStore = create<WorkspaceLSPState>()(
    devtools(
        persist(
            function (set) {
                return {
                    availableLSPs: [],
                    setAvailableLSPs: (v) => set({ availableLSPs: v }),

                    installedLSPs: [],
                    setInstalledLSPs: (v) => set({ installedLSPs: v }),

                    initializedLSPs: [],
                    setInitializedLSPs: (v) => set({ initializedLSPs: v }),
                };
            },
            {
                name: "workspace-lsp-store",
                partialize(state) {
                    // Skipping initialized LSPs as they we will initialize new connection on load
                    // and also skipping persisting available LSPs (for fresh data)
                    return {
                        installedLSPs: state.installedLSPs,
                    };
                },
            },
        ),
    ),
);
