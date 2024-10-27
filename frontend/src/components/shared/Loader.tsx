import "ldrs/lineSpinner";
import type React from "react";

export function Loader({
    sizeInPx = 24,
    color = "white",
    variant: type = "alone",
}: {
    sizeInPx?: number;
    color?: "white";
    variant?: "alone" | "page" | "section";
}): React.JSX.Element {
    switch (type) {
        case "page":
            return (
                <div className="flex items-center justify-center w-full my-32">
                    <l-line-spinner
                        size={sizeInPx.toString()}
                        color={color}
                    ></l-line-spinner>
                </div>
            );
        case "section":
            return (
                <div className="flex items-center justify-center w-full my-12">
                    <l-line-spinner
                        size={sizeInPx.toString()}
                        color={color}
                    ></l-line-spinner>
                </div>
            );
        default:
            return (
                <l-line-spinner
                    size={sizeInPx.toString()}
                    color={color}
                ></l-line-spinner>
            );
    }
}
