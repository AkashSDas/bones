import { Terminal } from "@xterm/xterm";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type TerminalId = string;
type TerminalInfo = {
    name: string;
    id: TerminalId;
    xtermInstance: Terminal;
};

type WorkspaceTerminalState = {
    terminals: TerminalInfo[];
    setTerminals: (terminals: TerminalInfo[]) => void;
    addTerminal: (item: TerminalInfo) => void;
    removeTerminal: (id: TerminalId) => void;

    activeTerminal: TerminalId | null;
    setActiveTerminal: (id: TerminalId | null) => void;
};

export function createTerminalInstance() {
    return new Terminal({
        allowProposedApi: true,
        fontFamily: "Fira Code, monospace",
        fontSize: 14,
        theme: {
            red: "\x1b[38;2;248;113;133m",
            green: "\x1b[38;2;134;239;172m",
            yellow: "\x1b[38;2;253;224;71m",
            blue: "\x1b[38;2;147;197;253m",
            magenta: "\x1b[38;2;249;168;212m",
            cyan: "\x1b[38;2;103;232;249m",
        },
    });
}

export const useWorkspaceTerminalStore = create<WorkspaceTerminalState>()(
    devtools(function (set, get) {
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
                    activeTerminal: newTerminals.length > 0 ? newTerminals[0].id : null,
                });
            },

            activeTerminal: null,
            setActiveTerminal(id) {
                set({ activeTerminal: id });
            },
        };
    }),
);
