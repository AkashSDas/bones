import "ldrs/lineSpinner";
import type React from "react";

type Props = {
    sizeInPx?: number;
    color?: "white";
};

export function Loader({ sizeInPx = 24, color = "white" }: Props): React.JSX.Element {
    return <l-line-spinner size={sizeInPx.toString()} color={color}></l-line-spinner>;
}
