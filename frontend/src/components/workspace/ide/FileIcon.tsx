import { Icon } from "@iconify/react";
import { useMemo } from "react";
import {
    getIconForFile,
    getIconForFolder,
    getIconForOpenFolder,
} from "vscode-icons-js";

function convertSnakeCaseToKebabCase(str: string): string {
    return str.replace(/_/g, "-");
}

function removeSvgExtension(str: string): string {
    return str.replace(".svg", "");
}

/** File icons which is dynamically generated (via Iconify) */
export function FileIcon(props: {
    filename: string;
    height?: number;
    width?: number;
    isOpen?: boolean;
    isDirectory?: boolean;
    isFile?: boolean;
}) {
    const icon = useMemo(
        function getIcon() {
            let name = "";

            if (props.isDirectory) {
                name = getIconForFolder(props.filename) ?? "";
            }
            if (props.isOpen) {
                name = getIconForOpenFolder(props.filename) ?? "";
            }
            if (props.isFile) {
                name = getIconForFile(props.filename) ?? "";
            }

            name = removeSvgExtension(name);
            name = convertSnakeCaseToKebabCase(name);

            if (name.length === 0) {
                return "vscode-icons:default-file";
            } else {
                return `vscode-icons:${name}`;
            }
        },
        [props.filename, props.isDirectory, props.isFile, props.isOpen],
    );

    return <Icon icon={icon} height={props.height ?? 30} width={props.width ?? 30} />;
}
