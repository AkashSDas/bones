import { useEffect } from "react";

import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { useWorkspaceLSP } from "@/hooks/workspace";
import { useWorkspaceStore } from "@/store/workspace";
import { useWorkspaceBridgeStore } from "@/store/workspace-bridge";
import { useWorkspaceLSPStore } from "@/store/workspace-lsp";
import { cn } from "@/utils/styles";
import { type SupportedLSP } from "@/utils/workspace-lsp";

import { FileIcon } from "./FileIcon";

export function LSPExtensions() {
    const contextWindow = useWorkspaceStore((s) => s.contextWindow);
    const { connectionStatus } = useWorkspaceBridgeStore();
    const { listAvailableLSPs, installLSP, listInstalledLSPs } = useWorkspaceLSP();
    const { installedLSPs, availableLSPs } = useWorkspaceLSPStore();

    useEffect(
        function () {
            if (connectionStatus === "connected") {
                listAvailableLSPs();
                listInstalledLSPs();
            }
        },
        [connectionStatus],
    );

    return (
        <div
            className={cn(
                "no-scrollbar h-full overflow-y-auto overflow-x-hidden border-r border-r-grey-900 !pb-12 group",
                contextWindow === "lsp" ? "block" : "hidden",
            )}
        >
            <div className="flex flex-col gap-[2px] mb-2 mt-2 px-2">
                <span className="text-sm tracking-wide text-grey-300">
                    Available Language Server
                </span>

                <span className="text-xs text-grey-500">
                    Refresh the browser to load installed LSP
                </span>
            </div>

            <hr className="my-0 border-grey-800" />

            {availableLSPs.length === 0 ? (
                <div className="flex items-center justify-center w-full my-10">
                    <Loader />
                </div>
            ) : null}

            {availableLSPs.length > 0 ? (
                <div className="flex flex-col w-full gap-2 px-2 mb-10">
                    {availableLSPs.map(function (lsp) {
                        const isInstalled = (installedLSPs as string[]).includes(
                            lsp.lspName,
                        );

                        return (
                            <div key={lsp.lspName} className="flex gap-2 px-2 py-2">
                                <div className="flex justify-center p-1 rounded-sm">
                                    <FileIcon
                                        filename={`file.${lsp.extension}`}
                                        height={24}
                                        width={24}
                                        isFile
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm">
                                        {lsp.lspReadableName}
                                    </span>
                                    <span className="text-sm text-grey-500">
                                        {lsp.installationPrerequisite[0].description}.{" "}
                                        <strong className="font-medium">
                                            If installed then only install LSP
                                        </strong>
                                        . Following is an example command to install
                                        required tool:
                                    </span>
                                    <pre className="px-1 text-sm rounded-sm select-all text-grey-500 bg-grey-900">
                                        {
                                            lsp.installationPrerequisite[0]
                                                .exampleInstallCommand
                                        }
                                    </pre>

                                    <Button
                                        variant={isInstalled ? "secondary" : "default"}
                                        className="!h-7 w-fit mt-1"
                                        disabled={isInstalled}
                                        onClick={function install() {
                                            if (!isInstalled) {
                                                installLSP(
                                                    lsp.lspName as unknown as SupportedLSP,
                                                );
                                            }
                                        }}
                                    >
                                        {isInstalled ? "Installed" : "Install"}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
