import { describe, expect, it } from "vitest";

import { formatDate } from "@/utils/datetime";

describe("formatDate", () => {
    const dateStr = "2024-10-10 19:42:03.743575+00";

    it('should format date as "DD MMM YYYY"', () => {
        expect(formatDate(dateStr, "DD MMM YYYY")).toBe("10 Oct 2024");
    });

    it('should format date as "MMM DD, YYYY"', () => {
        expect(formatDate(dateStr, "MMM DD, YYYY")).toBe("Oct 10, 2024");
    });

    it('should format date as "YYYY-MM-DD"', () => {
        expect(formatDate(dateStr, "YYYY-MM-DD")).toBe("2024-10-10");
    });

    it('should format date as "MM/DD/YYYY"', () => {
        expect(formatDate(dateStr, "MM/DD/YYYY")).toBe("10/10/2024");
    });

    it('should format date as "fullDateTime"', () => {
        const formattedDate = formatDate(dateStr, "fullDateTime");
        expect(formattedDate).toContain("10/10/2024");
    });

    it('should return "Invalid format type" for unknown format', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(formatDate(dateStr, "unknown" as unknown as any)).toBe(
            "Invalid format type",
        );
    });
});
