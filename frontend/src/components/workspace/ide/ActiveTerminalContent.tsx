import { useMemo } from "react";

import { useWorkspaceTerminalStore } from "@/store/workspace-terminal";

export function ActiveTerminalContent() {
    const { terminals, activeTerminal } = useWorkspaceTerminalStore();
    const terminal = useMemo(() => {
        return terminals.find((i) => i.id == activeTerminal);
    }, [terminals, activeTerminal]);

    if (!terminal) return null;

    return <div>terminal {terminal.id}</div>;
}
