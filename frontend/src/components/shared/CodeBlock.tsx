import { useLayoutEffect, useState } from "react";

import { getEditorLanguage } from "@/utils/workspace-editor";
import { highlightCodeText } from "@/utils/workspace-file-tree";

import { Loader } from "./Loader";

export function CodeBlock(props: {
    codeText: string;
    filename: string;
    className?: string;
}) {
    const { codeText, filename, className } = props;
    const [code, setCode] = useState<React.JSX.Element | null>(null);

    useLayoutEffect(() => {
        const lang = getEditorLanguage(filename);
        void highlightCodeText(codeText, lang).then((v) => setCode(v));
    }, []);

    return code ? (
        <div
            className="text-sm search-file-preivew-code"
            style={{ fontFamily: "Fira Code" }}
        >
            {code}
        </div>
    ) : (
        <div className={className ?? "w-full flex items-center justify-center h-3"}>
            <Loader sizeInPx={18} />
        </div>
    );
}
