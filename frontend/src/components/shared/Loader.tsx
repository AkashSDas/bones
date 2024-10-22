import "ldrs/orbit";
import React from "react";

type Props = {
    sizeInPx?: number;
    color?: "white";
};

export function Loader({ sizeInPx = 24, color = "white" }: Props): React.JSX.Element {
    return (
        <div>
            <l-orbit size={sizeInPx.toString()} color={color}></l-orbit>
        </div>
    );
}
