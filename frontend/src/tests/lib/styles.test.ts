import { describe, expect, it } from "vitest";

import { cn } from "@/utils/styles";

describe("cn function", () => {
    it("should merge class names correctly", () => {
        const result = cn("text-red-500", "bg-blue-500");
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle conditional class names", () => {
        const result = cn(
            "text-red-500",
            // eslint-disable-next-line no-constant-binary-expression
            false && "bg-blue-500",
            "hover:bg-green-500",
        );
        expect(result).toBe("text-red-500 hover:bg-green-500");
    });

    it("should merge conflicting Tailwind classes", () => {
        const result = cn("text-red-500", "text-blue-500");
        expect(result).toBe("text-blue-500"); // Tailwind merge resolves conflicts
    });

    it("should handle undefined, null, or false values", () => {
        const result = cn("text-red-500", undefined, null, false, "bg-blue-500");
        expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should return an empty string for no input", () => {
        const result = cn();
        expect(result).toBe("");
    });
});
