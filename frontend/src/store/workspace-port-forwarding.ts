import { create } from "zustand";
import { devtools } from "zustand/middleware";

type PortMapping = {
    internalPort: number;
    externalPort: number;
};

type WorkspacePortForwardingState = {
    /* This loading state will be used for all of the operations with the bridge (create/delete/list) */
    isLoading: boolean;
    setIsLoading: (v: boolean) => void;

    availableExternalPorts: number[];
    setAvailableExternalPorts: (v: number[]) => void;

    currentMappings: PortMapping[];
    setCurrentMappings: (v: PortMapping[]) => void;
    createMapping: (v: PortMapping) => void;
    deleteMapping: (v: PortMapping) => void;
};

export const useWorkspacePortForwardingStore = create<WorkspacePortForwardingState>()(
    devtools(
        function (set, get) {
            return {
                isLoading: false,
                setIsLoading: (v) => set({ isLoading: v }),

                availableExternalPorts: [],
                setAvailableExternalPorts: (v) => set({ availableExternalPorts: v }),

                currentMappings: [],
                setCurrentMappings: (v) => set({ currentMappings: v }),
                createMapping: (v) => {
                    set({ currentMappings: [...get().currentMappings, v] });
                },
                deleteMapping: (v) => {
                    set({
                        currentMappings: get().currentMappings.filter(
                            (m) =>
                                m.externalPort !== v.externalPort &&
                                m.internalPort !== v.internalPort,
                        ),
                    });
                },
            };
        },
        {
            name: "workspace-port-fowarding-store",
        },
    ),
);
