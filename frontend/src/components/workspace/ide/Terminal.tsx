import { useMemo } from "react";

import { useWorkspaceTerminalStore } from "@/store/workspace-terminal";

import { XtermTerminal } from "./XtermTerminal";

export function Terminal(props: { terminalId: string }) {
    const { terminals } = useWorkspaceTerminalStore();

    const terminal = useMemo(() => {
        return terminals.find((t) => t.id === props.terminalId);
    }, [terminals, props.terminalId]);

    if (!terminal) return null;

    return <XtermTerminal terminalId={props.terminalId} />;
}
