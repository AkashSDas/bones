import { CheckIcon, DeleteIcon, MoveRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Loader } from "@/components/shared/Loader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/shared/Select";
import { useWorkspacePortForwarding } from "@/hooks/workspace";
import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspacePortForwardingStore } from "@/store/workspace-port-forwarding";
import { cn } from "@/utils/styles";

export function PortForwarding() {
    const contextWindow = useWorkspaceStore((s) => s.contextWindow);
    const { isLoading, availableExternalPorts, currentMappings } =
        useWorkspacePortForwardingStore();
    const { listAvailablePorts, listCurrentMapping, createMapping, deleteMapping } =
        useWorkspacePortForwarding();

    const [internalPortInput, setInternalPortInput] = useState("");
    const [externalPortInput, setExternalPortInput] = useState("");

    const { connectionStatus } = useWorkspaceBridgeStore();

    const isConnected = connectionStatus === "connected";

    useEffect(
        function init() {
            if (isConnected) {
                listAvailablePorts();
                listCurrentMapping();
            }
        },
        [isConnected],
    );

    return (
        <div
            className={cn(
                "p-2 no-scrollbar h-full overflow-y-auto overflow-x-hidden border-r border-r-grey-900 !pb-12 group",
                contextWindow === "networking" ? "block" : "hidden",
            )}
        >
            <p className="text-sm font-medium text-grey-400">Port Forwarding</p>
            <p className="text-sm text-grey-500">
                Map internal port to available external ports
            </p>

            <hr className="my-2 border-grey-800" />

            {isLoading ? (
                <div className="flex items-center justify-center w-full my-10">
                    <Loader />
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {currentMappings.map(({ internalPort, externalPort }) => {
                        return (
                            <div
                                key={`${internalPort}-${externalPort}`}
                                className="flex items-center gap-1 h-10"
                            >
                                <span className="text-sm textgre-400 flex-1 flex items-center gap-1">
                                    <span>{internalPort} (in)</span>
                                    <span>
                                        <MoveRightIcon size={14} />
                                    </span>
                                    <span>{externalPort} (out)</span>
                                </span>

                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={() => {
                                        deleteMapping(internalPort, externalPort);
                                    }}
                                >
                                    <DeleteIcon />
                                </Button>
                            </div>
                        );
                    })}

                    <div className="flex items-center gap-1">
                        <Input
                            placeholder="Internal port"
                            value={internalPortInput}
                            type="number"
                            min={0}
                            max={65_000}
                            className="!h-9 flex-1 text-sm"
                            onChange={(e) => setInternalPortInput(e.target.value)}
                        />

                        <Select
                            onValueChange={setExternalPortInput}
                            value={externalPortInput}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="External port" />
                            </SelectTrigger>

                            <SelectContent>
                                {availableExternalPorts.map((port) => {
                                    return (
                                        <SelectItem
                                            key={`${port}`}
                                            value={String(port)}
                                            className="py-1 cursor-pointer"
                                        >
                                            {port}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Button
                            size="icon"
                            onClick={() => {
                                createMapping(
                                    Number(internalPortInput),
                                    Number(externalPortInput),
                                );
                            }}
                        >
                            <CheckIcon />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
