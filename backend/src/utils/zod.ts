import type { ZodError, ZodIssue } from "zod";

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatZodErrors(zodError: ZodError): Record<string, string> {
    return Object.fromEntries(
        zodError.issues.map((errorObj: ZodIssue) => [
            errorObj.path.join("."), // Joining path array to form a string path
            capitalize(errorObj.message),
        ]),
    );
}
