import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// https://github.com/tailwindlabs/tailwindcss/discussions/7558#discussioncomment-4676228
export function tw(strings: TemplateStringsArray, ...keys: unknown[]): string {
    const lastIndex = strings.length - 1;
    return (
        strings.slice(0, lastIndex).reduce((acc, str, i) => {
            return acc + str + keys[i];
        }, "") + strings[lastIndex]
    );
}
