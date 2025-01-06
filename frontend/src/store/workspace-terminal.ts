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
            foreground: "#e6d4a3",
            background: "#1e1e1e",
            cursor: "#bbbbbb",

            black: "#161819",
            brightBlack: "#7f7061",

            red: "#f73028",
            brightRed: "#be0f17",

            green: "#aab01e",
            brightGreen: "#868715",

            yellow: "#f7b125",
            brightYellow: "#cc881a",

            blue: "#719586",
            brightBlue: "#377375",

            magenta: "#c77089",
            brightMagenta: "#a04b73",

            cyan: "#7db669",
            brightCyan: "#578e57",

            white: "#faefbb",
            brightWhite: "#e6d4a3",
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
                const newTerminals = get().terminals.filter((i) => i.id !== id);
                let activeTerminal = get().activeTerminal;

                if (id === get().activeTerminal) {
                    if (newTerminals.length > 0) {
                        activeTerminal = newTerminals[0].id;
                    } else {
                        activeTerminal = null;
                    }
                }

                set({ terminals: newTerminals, activeTerminal });
            },

            activeTerminal: null,
            setActiveTerminal(id) {
                set({ activeTerminal: id });
            },
        };
    }),
);
