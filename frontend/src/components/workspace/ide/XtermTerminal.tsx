import { FitAddon } from "@xterm/addon-fit";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useCallback, useEffect, useRef } from "react";

import { useWorkspaceURL } from "@/hooks/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceTerminalStore } from "@/store/workspace-terminal";

export function useTerminal(terminalId: string) {
    const { bridgeV2WsURL } = useWorkspaceURL();
    const { bridge2Socket } = useWorkspaceBridgeStore();

    const runCommand = useCallback(
        function (command: string) {
            if (bridge2Socket && bridgeV2WsURL) {
                bridge2Socket.send(
                    JSON.stringify({
                        type: "terminal",
                        event: "runCommand",
                        payload: {
                            id: terminalId,
                            command,
                        },
                    }),
                );
            }
        },
        [bridgeV2WsURL, bridge2Socket],
    );

    const resize = useCallback(
        function (cols: number, rows: number) {
            if (bridge2Socket && bridgeV2WsURL) {
                bridge2Socket.send(
                    JSON.stringify({
                        type: "terminal",
                        event: "resize",
                        payload: {
                            id: terminalId,
                            cols,
                            rows,
                        },
                    }),
                );
            }
        },
        [bridgeV2WsURL, bridge2Socket],
    );

    return {
        runCommand,
        resize,
    };
}

export function XtermTerminal({ terminalId }: { terminalId: string }) {
    const divRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const { bridgeV2WsURL } = useWorkspaceURL();

    const { terminals } = useWorkspaceTerminalStore();
    const { resize, runCommand } = useTerminal(terminalId);

    useEffect(() => {
        if (!bridgeV2WsURL) return;

        const xterm = terminals.find((t) => t.id === terminalId)?.xtermInstance;
        if (!xterm) return;

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        const unicodeAddon = new Unicode11Addon();

        xterm.loadAddon(fitAddon);
        xterm.loadAddon(webLinksAddon);
        xterm.loadAddon(unicodeAddon);

        xterm.open(divRef.current!);

        // Fit the terminal to its initial container size
        const handleInitialFit = () => {
            fitAddon.fit();
            const dimensions = fitAddon.proposeDimensions();

            if (dimensions) {
                resize(dimensions.cols, dimensions.rows);
            }
        };
        handleInitialFit();

        // Resize on window resize
        const handleResize = () => {
            fitAddon.fit();
            const dimensions = fitAddon.proposeDimensions();

            if (dimensions) {
                resize(dimensions.cols, dimensions.rows);
            }
        };

        window.addEventListener("resize", handleResize);

        termRef.current = xterm;

        xterm.onData((data) => runCommand(data));
        xterm.onResize(({ cols, rows }) => resize(cols, rows));

        return () => {
            window.removeEventListener("resize", handleResize);
            xterm.dispose();
        };
    }, [bridgeV2WsURL]);

    return <div ref={divRef} className="w-full h-full overflow-y-auto" />;
}
