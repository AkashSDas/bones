import { describe, expect, it } from "vitest";

import { formatDate, timeAgo } from "@/utils/datetime";

describe("DateTime Utils", () => {
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

    describe("timeAgo", () => {
        it('should return "just now" for the current time', () => {
            const now = new Date().toISOString();
            expect(timeAgo(now)).toBe("just now");
        });

        it('should return "1 second" for a date 1 second ago', () => {
            const date = new Date(Date.now() - 1000).toISOString();
            expect(timeAgo(date)).toBe("1 second");
        });

        it('should return "5 seconds" for a date 5 seconds ago', () => {
            const date = new Date(Date.now() - 5000).toISOString();
            expect(timeAgo(date)).toBe("5 seconds");
        });

        it('should return "1 minute" for a date 1 minute ago', () => {
            const date = new Date(Date.now() - 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 minute");
        });

        it('should return "10 minutes" for a date 10 minutes ago', () => {
            const date = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("10 minutes");
        });

        it('should return "1 hour" for a date 1 hour ago', () => {
            const date = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 hour");
        });

        it('should return "2 hours" for a date 2 hours ago', () => {
            const date = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("2 hours");
        });

        it('should return "1 day" for a date 1 day ago', () => {
            const date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 day");
        });

        it('should return "1 week" for a date 7 days ago', () => {
            const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 week");
        });

        it('should return "1 month" for a date 30 days ago', () => {
            const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 month");
        });

        it('should return "1 year" for a date 365 days ago', () => {
            const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 year");
        });

        it('should return "1 year 2 months" for a date 425 days ago', () => {
            const date = new Date(Date.now() - 425 * 24 * 60 * 60 * 1000).toISOString();
            expect(timeAgo(date)).toBe("1 year 2 months");
        });

        it('should return only the first two units, such as "2 weeks 3 days"', () => {
            const date = new Date(
                Date.now() - (2 * 7 * 24 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000),
            ).toISOString();
            expect(timeAgo(date)).toBe("2 weeks 3 days");
        });

        it('should return only the first two units, such as "1 day 2 hours"', () => {
            const date = new Date(
                Date.now() - (1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            ).toISOString();
            expect(timeAgo(date)).toBe("1 day 2 hours");
        });
    });
});
