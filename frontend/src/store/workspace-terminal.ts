import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type TerminalId = string;
type TerminalInfo = {
    name: string;
    id: TerminalId;
};

type WorkspaceTerminalState = {
    terminals: TerminalInfo[];
    addTerminal: (item: TerminalInfo) => void;
    removeTerminal: (id: TerminalId) => void;
};

export const useWorkspaceTerminalStore = create<WorkspaceTerminalState>()(
    devtools(
        persist(
            function (set, get) {
                return {
                    terminals: [],
                    addTerminal(item) {
                        set({ terminals: [...get().terminals, item] });
                    },
                    removeTerminal(id) {
                        set({
                            terminals: [...get().terminals.filter((i) => i.id != id)],
                        });
                    },
                };
            },
            {
                name: "workspace-terminal-store",
            },
        ),
    ),
);
