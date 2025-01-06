import * as monaco from "monaco-editor";
import * as Y from "yjs";
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import Editor, { loader } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useEffect, useMemo, useState } from "react";
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

const yDocs = new Map<string, Y.Doc>();
const providers = new Map<string, WebsocketProvider>();
const bindings = new Map<string, MonacoBinding>();

function getYDoc(filePath: string): Y.Doc {
    if (!yDocs.has(filePath)) {
        const yDoc = new Y.Doc({ guid: filePath });
        yDocs.set(filePath, yDoc);
    }
    return yDocs.get(filePath)!;
}

function getOrCreateMonacoModel(
    monacoInstance: typeof monaco,
    filePath: string,
    language: string,
    content: string,
) {
    const uri = monacoInstance.Uri.parse(filePath);
    let model = monacoInstance.editor.getModel(uri);

    if (!model) {
        model = monacoInstance.editor.createModel(content, language, uri);
    }

    return model;
}

export function IdeEditor({ file, paneId }: { file: File; paneId: string }) {
    const { loadingFiles, files, setActivePaneId } = useWorkspaceStore();
    const { bridgeV2WsURL } = useWorkspaceURL();
    const { user, account } = useAuth();

    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(
        null,
    );

    const language = useMemo(() => getEditorLanguage(file.name), [file]);
    const userColor = useMemo(
        () => COLORS[Math.floor(Math.random() * COLORS.length)],
        [],
    );

    useEffect(() => {
        const yDoc = getYDoc(file.absolutePath);
        const yText = yDoc.getText(file.absolutePath);

        if (!monaco?.editor || !bridgeV2WsURL || !editor || !files[file.absolutePath]) {
            return;
        }

        const model = getOrCreateMonacoModel(
            monaco,
            file.absolutePath,
            language,
            files[file.absolutePath],
        );

        // Reuse or create the WebSocketProvider
        let wsProvider = providers.get(file.absolutePath);
        if (!wsProvider) {
            wsProvider = new WebsocketProvider(
                `${bridgeV2WsURL}/code-file-collaboration`,
                file.absolutePath,
                yDoc,
                { maxBackoffTime: 25000 },
            );
            providers.set(file.absolutePath, wsProvider);

            wsProvider.on("status", ({ status }) => {
                console.log(`Connection status for ${file.absolutePath}:`, status);
            });

            wsProvider.on("sync", (isSynced) => {
                console.log(`Document synced for ${file.absolutePath}:`, isSynced);
                if (
                    isSynced &&
                    yText.length === 0 &&
                    yText.doc?.guid === file.absolutePath
                ) {
                    yText.insert(0, files[file.absolutePath]);
                }

                if (isSynced && model.getValue() === "" && yText.toString() !== "") {
                    model.setValue(yText.toString());
                }
            });
        }

        // Reuse or create the MonacoBinding
        let binding = bindings.get(file.absolutePath);
        if (!binding) {
            const awareness = wsProvider.awareness;
            awareness.setLocalStateField("user", {
                name: user?.username ?? account?.accountName ?? "Unknown",
                color: userColor,
                paneId,
            });

            binding = new MonacoBinding(yText, model, new Set([editor]), awareness);
            bindings.set(file.absolutePath, binding);
        } else {
            // Add the current editor to the existing binding
            binding.editors.add(editor);
        }

        // Connect the provider
        wsProvider.connect();

        return () => {
            // Remove the current editor from the binding
            if (binding && binding.editors.has(editor)) {
                binding.editors.delete(editor);
            }

            // Cleanup provider and binding if no editors are left
            if (binding && binding.editors.size === 0) {
                binding.destroy();
                bindings.delete(file.absolutePath);
            }

            if (wsProvider && bindings.size === 0) {
                wsProvider.destroy();
                providers.delete(file.absolutePath);
            }
        };
    }, [bridgeV2WsURL, file.absolutePath, editor, files, language, paneId, userColor]);

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
