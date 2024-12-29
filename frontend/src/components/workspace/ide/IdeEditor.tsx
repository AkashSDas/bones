import * as monaco from "monaco-editor";
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import Editor, { loader } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useMemo } from "react";
import { createHighlighter } from "shiki";
// We need to import this so monaco-languageclient can use vscode-api
import "vscode/localExtensionHost";
import { initialize } from "vscode/services";

import { useWorkspaceStore } from "@/store/workspace";
import { getEditorLanguage } from "@/utils/workspace-editor";
import { type File } from "@/utils/workspace-file-tree";

export type WorkerLoader = () => Worker;

self.MonacoEnvironment = {
    getWorker: (_moduleId, _label) => new editorWorker(),
};

loader.config({ monaco: monaco });

(async function () {
    await initialize({
        ...getLanguagesServiceOverride(),
        ...getConfigurationServiceOverride(),
    }).then(() => {
        loader.init().then(/* ... */);
    });
})();

export function IdeEditor({ file, paneId }: { file: File; paneId: string }) {
    const { loadingFiles, files, setActivePaneId } = useWorkspaceStore();

    const language = useMemo(
        function () {
            return getEditorLanguage(file.name);
        },
        [file],
    );

    return (
        <Editor
            theme="vitesse-dark"
            path={file.absolutePath}
            defaultLanguage={language}
            language={language}
            loading={loadingFiles.includes(file.absolutePath)}
            keepCurrentModel
            defaultValue={files[file.absolutePath] ?? ""}
            value={files[file.absolutePath] ?? ""}
            defaultPath={file.absolutePath}
            beforeMount={async (monaco) => {
                monaco.editor.onDidCreateEditor((editor) => {
                    editor.onDidFocusEditorText(function changeActivePane() {
                        setActivePaneId(paneId);
                    });
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

                monaco.languages.register({ id: "jsx" });
                monaco.languages.register({ id: "tsx", extensions: ["tsx"] });
                monaco.languages.register({ id: "html" });
                monaco.languages.register({ id: "css" });
                monaco.languages.register({ id: "toml" });
                monaco.languages.register({ id: "yaml" });
                monaco.languages.register({ id: "json" });
                monaco.languages.register({ id: "python" });
                monaco.languages.register({ id: "go" });
                monaco.languages.register({ id: "json", extensions: ["json"] });
                monaco.languages.register({ id: "typescript", extensions: ["ts"] });
                monaco.languages.register({ id: "javascript" });
                monaco.languages.register({ id: "markdown" });

                shikiToMonaco(highlighter, monaco);
            }}
            options={{
                minimap: {
                    enabled: false,
                },
                fontSize: 14,
                cursorStyle: "line",
                fontFamily: "Fira Code",
                fontLigatures: true,
                cursorSmoothCaretAnimation: "on",
                lineNumbers: "on",
                showFoldingControls: "mouseover",
                stickyScroll: {
                    enabled: true,
                },
                fixedOverflowWidgets: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
            }}
        />
    );
}
