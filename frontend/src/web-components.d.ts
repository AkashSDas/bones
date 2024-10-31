import type { DetailedHTMLProps, HTMLAttributes } from "react";

export {}; // This makes this file an external module

// LDRS component gives web components and to avoid TypeScript error of not
// valid JSX element loader is attached to the types
declare global {
    namespace JSX {
        interface IntrinsicElements {
            // Only keep loader that's being used (if LDRS pkg loader is used)
            "l-line-spinner": DetailedHTMLProps<
                HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                color?: string;
                size?: string;
                stroke?: string;
                speed?: string;
            };
        }
    }
}
