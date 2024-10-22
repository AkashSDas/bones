import type { DetailedHTMLProps, HTMLAttributes } from "react";

export {}; // This makes this file an external module

// LDRS component gives web components and to avoid TypeScript error of not
// valid JSX element loader is attached to the types
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "l-orbit": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
                color?: string;
                size?: string;
                stroke?: string;
                speed?: string;
            };
        }
    }
}
