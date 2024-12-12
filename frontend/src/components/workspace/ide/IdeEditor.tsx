import Editor, { useMonaco } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { useEffect, useMemo } from "react";
import { createHighlighter } from "shiki";

import { useWorkspaceStore } from "@/store/workspace";
import { getEditorLanguage } from "@/utils/workspace-editor";
import { type File } from "@/utils/workspace-file-tree";

export function IdeEditor({ file, paneId }: { file: File; paneId: string }) {
    const { loadingFiles, files, setActivePaneId } = useWorkspaceStore();

    const language = useMemo(
        function () {
            return getEditorLanguage(file.name);
        },
        [file],
    );

    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            (async function setupEditor() {})();
        }
    }, [monaco]);

    return (
        <Editor
            theme="vitesse-dark"
            path={file.name}
            defaultLanguage={language}
            loading={loadingFiles.includes(file.absolutePath)}
            keepCurrentModel
            defaultValue={files[file.absolutePath] ?? ""}
            value={files[file.absolutePath] ?? ""}
            beforeMount={async (monaco) => {
                monaco.editor.onDidCreateEditor((editor) => {
                    editor.onDidFocusEditorText(function changeActivePane() {
                        setActivePaneId(paneId);
                    });
                });

                const highlighter = await createHighlighter({
                    themes: ["vitesse-dark", "one-dark-pro", "everforest-dark"],
                    langs: ["javascript", "typescript", "jsx", "tsx", "toml", "yaml"],
                });

                monaco.languages.register({ id: "jsx" });
                monaco.languages.register({ id: "tsx" });
                monaco.languages.register({ id: "toml" });
                monaco.languages.register({ id: "yaml" });
                monaco.languages.register({ id: "typescript" });
                monaco.languages.register({ id: "javascript" });

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
            }}
        />
    );
}
