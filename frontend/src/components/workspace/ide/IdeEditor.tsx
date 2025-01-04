import * as monaco from "monaco-editor";
import * as Y from "yjs";
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import Editor, { loader } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useEffect, useMemo, useRef, useState } from "react";
import { createHighlighter } from "shiki";
import "vscode/localExtensionHost";
import { initialize } from "vscode/services";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";

import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/auth";
import { useWorkspaceURL } from "@/hooks/workspace";
import { useWorkspaceStore } from "@/store/workspace";
import { getEditorLanguage } from "@/utils/workspace-editor";
import { type File } from "@/utils/workspace-file-tree";

self.MonacoEnvironment = {
    getWorker: (_moduleId, _label) => new editorWorker(),
};

loader.config({ monaco });

(async function () {
    await initialize({
        ...getLanguagesServiceOverride(),
        ...getConfigurationServiceOverride(),
    }).then(() => {
        loader.init();
    });
})();

const COLORS = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
];

export function IdeEditor({ file, paneId }: { file: File; paneId: string }) {
    const { loadingFiles, files, setActivePaneId } = useWorkspaceStore();
    const { bridgeV2WsURL } = useWorkspaceURL();
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const { user, account } = useAuth();

    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(
        null,
    );

    const language = useMemo(() => getEditorLanguage(file.name), [file]);

    const userColor = useMemo(() => {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }, []);

    useEffect(
        function setupCollaboration() {
            const yDoc = new Y.Doc();

            (async function () {
                if (
                    !monaco?.editor ||
                    !bridgeV2WsURL ||
                    !editor ||
                    !files[file.absolutePath]
                )
                    return;

                const model = editor.getModel();
                const roomId = file.absolutePath;

                if (!model) return;

                const wsProvider = new WebsocketProvider(
                    `${bridgeV2WsURL}/code-file-collaboration`,
                    roomId,
                    yDoc,
                    {
                        maxBackoffTime: 25000,
                    },
                );

                providerRef.current = wsProvider;

                const yText = yDoc.getText(roomId);

                wsProvider.on("status", ({ status }) => {
                    console.log(`Connection status for ${roomId}:`, status);
                });

                const awareness = wsProvider.awareness;

                awareness.setLocalStateField("user", {
                    name: user?.username ?? account?.accountName ?? "Unknown",
                    color: userColor,
                });

                wsProvider.on("sync", (isSynced) => {
                    console.log(`Document synced for ${roomId}:`, isSynced);

                    // Initialize the document with content only if it's empty
                    if (isSynced && yText.length === 0) {
                        yText.insert(0, files[file.absolutePath]);
                    }

                    if (
                        isSynced &&
                        model &&
                        model.getValue() === "" &&
                        yText.toString() !== ""
                    ) {
                        model.setValue(yText.toString());
                    }
                });

                try {
                    const binding = new MonacoBinding(
                        yText,
                        model,
                        new Set([editor]),
                        awareness,
                    );

                    providerRef.current.connect();
                    bindingRef.current = binding;
                } catch (error) {
                    console.error("Error creating Monaco binding:", error);
                }
            })();

            return function cleanup() {
                if (bindingRef.current) {
                    bindingRef.current.destroy();
                    bindingRef.current = null;
                }

                if (providerRef.current) {
                    providerRef.current.destroy();
                    providerRef.current = null;
                }

                yDoc.destroy();
            };
        },
        [bridgeV2WsURL, file.absolutePath, editor, files],
    );

    if (files[file.absolutePath] === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    return (
        <Editor
            theme="vitesse-dark"
            path={file.absolutePath}
            defaultLanguage={language}
            language={language}
            loading={loadingFiles.includes(file.absolutePath)}
            keepCurrentModel
            defaultPath={file.absolutePath}
            beforeMount={async (monaco) => {
                monaco.editor.onDidCreateEditor((editor) => {
                    editor.onDidFocusEditorText(() => {
                        setActivePaneId(paneId);
                    });

                    setEditor(editor as unknown as monaco.editor.IStandaloneCodeEditor);
                });

                const highlighter = await createHighlighter({
                    themes: ["vitesse-dark", "one-dark-pro", "everforest-dark"],
                    langs: [
                        "javascript",
                        "typescript",
                        "jsx",
                        "tsx",
                        "toml",
                        "yaml",
                        "json",
                        "python",
                        "go",
                        "html",
                        "css",
                        "markdown",
                    ],
                });

                const languages = [
                    { id: "jsx" },
                    { id: "tsx", extensions: ["tsx"] },
                    { id: "html" },
                    { id: "css" },
                    { id: "toml" },
                    { id: "yaml" },
                    { id: "json", extensions: ["json"] },
                    { id: "python" },
                    { id: "go" },
                    { id: "typescript", extensions: ["ts"] },
                    { id: "javascript" },
                    { id: "markdown" },
                ];

                languages.forEach((lang) => monaco.languages.register(lang));
                shikiToMonaco(highlighter, monaco);
            }}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                cursorStyle: "line",
                fontFamily: "Fira Code",
                fontLigatures: true,
                cursorSmoothCaretAnimation: "on",
                lineNumbers: "on",
                showFoldingControls: "mouseover",
                stickyScroll: { enabled: true },
                fixedOverflowWidgets: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
            }}
        />
    );
}
