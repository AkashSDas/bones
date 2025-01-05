import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type TerminalId = string;
type TerminalInfo = {
    name: string;
    id: TerminalId;
};

type WorkspaceTerminalState = {
    terminals: TerminalInfo[];
    setTerminals: (terminals: TerminalInfo[]) => void;
    addTerminal: (item: TerminalInfo) => void;
    removeTerminal: (id: TerminalId) => void;

    activeTerminal: TerminalId | null;
    setActiveTerminal: (id: TerminalId | null) => void;
};

export const useWorkspaceTerminalStore = create<WorkspaceTerminalState>()(
    devtools(
        persist(
            function (set, get) {
                return {
                    terminals: [],
                    setTerminals(terminals) {
                        let activeTerminal: null | TerminalId = null;

                        if (Array.isArray(terminals) && terminals.length > 0) {
                            activeTerminal = terminals[0].id;
                        }

                        set({ terminals, activeTerminal });
                    },
                    addTerminal(item) {
                        set({
                            terminals: [...get().terminals, item],
                            activeTerminal: item.id,
                        });
                    },
                    removeTerminal(id) {
                        const newTerminals = get().terminals.filter((i) => i.id != id);

                        set({
                            terminals: newTerminals,
                            activeTerminal:
                                newTerminals.length > 0 ? newTerminals[0].id : null,
                        });
                    },

                    activeTerminal: null,
                    setActiveTerminal(id) {
                        set({ activeTerminal: id });
                    },
                };
            },
            {
                name: "workspace-terminal-store",
            },
        ),
    ),
);
