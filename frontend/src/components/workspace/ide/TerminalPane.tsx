import { TerminalIcon, XIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/shared/Button";
import { useWorkspaceTerminal, useWorkspaceURL } from "@/hooks/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceTerminalStore } from "@/store/workspace-terminal";
import { cn } from "@/utils/styles";

import { Terminal } from "./Terminal";

export function TerminalPane() {
    const { bridgeV2WsURL } = useWorkspaceURL();
    const { bridge2Socket } = useWorkspaceBridgeStore();
    const { getTerminals, createTerminal, deleteTerminal } = useWorkspaceTerminal();
    const { terminals, activeTerminal, setActiveTerminal, removeTerminal } =
        useWorkspaceTerminalStore();

    useEffect(
        function init() {
            if (!bridge2Socket || !bridgeV2WsURL) return;
            getTerminals();
        },
        [bridge2Socket, bridgeV2WsURL],
    );

    return (
        <div className="flex h-full">
            <div className="relative flex-1 h-full border-r border-r-grey-900">
                {terminals.map((terminal) => {
                    const isActive = activeTerminal === terminal.id;

                    return (
                        <div
                            key={terminal.id}
                            className={cn(
                                isActive ? "visible h-full" : "invisible h-0",
                            )}
                        >
                            <Terminal key={terminal.id} terminalId={terminal.id} />
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col h-full px-1 py-2 min-w-60">
                <Button
                    variant="secondary"
                    className="!h-7 !text-xs mb-1"
                    onClick={createTerminal}
                >
                    Create
                </Button>

                {terminals.map((terminal) => (
                    <button
                        key={terminal.id}
                        onClick={() => setActiveTerminal(terminal.id)}
                        className={cn(
                            "flex items-center justify-start gap-1 px-2 text-xs h-7 text-grey-300 rounded",
                            activeTerminal === terminal.id ? "bg-grey-900" : null,
                        )}
                    >
                        <TerminalIcon size={16} />
                        <span className="flex-1 text-start">{terminal.name}</span>
                        <button
                            className="h-7 w-7"
                            onClick={() => {
                                removeTerminal(terminal.id);
                                deleteTerminal(terminal.id);
                            }}
                        >
                            <XIcon size={16} />
                        </button>
                    </button>
                ))}
            </div>
        </div>
    );
}
