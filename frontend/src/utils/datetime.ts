export function formatDate(
    dateStr: string,
    formatType:
        | "DD MMM YYYY"
        | "MMM DD, YYYY"
        | "YYYY-MM-DD"
        | "MM/DD/YYYY"
        | "fullDateTime"
        | "DD MMM YYYY AM/PM",
): string {
    const date = new Date(dateStr);

    const day = date.getUTCDate().toString().padStart(2, "0");
    const monthShort = date.toLocaleString("en-GB", {
        month: "short",
        timeZone: "UTC",
    });
    const monthNumber = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();

    const hours12 = date.getUTCHours() % 12 || 12; // 12-hour format
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const amPm = date.getUTCHours() < 12 ? "AM" : "PM";

    switch (formatType) {
        case "DD MMM YYYY":
            return `${day} ${monthShort} ${year}`;
        case "MMM DD, YYYY":
            return `${monthShort} ${day}, ${year}`;
        case "YYYY-MM-DD":
            return `${year}-${monthNumber}-${day}`;
        case "MM/DD/YYYY":
            return `${monthNumber}/${day}/${year}`;
        case "fullDateTime":
            return date.toLocaleString("en-GB", { timeZone: "UTC" });
        case "DD MMM YYYY AM/PM":
            return `${day} ${monthShort} ${year} ${hours12}:${minutes} ${amPm}`;
        default:
            return "Invalid format type";
    }
}

/**
 * @example
 * ```javascript
 * console.log(timeAgo("2024-10-10 19:42:03.743575+00")); // Output like "2 weeks 3 days"
 * ```
 */
export function timeAgo(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    const now = new Date();

    // Calculate differences in milliseconds
    let diff = Math.abs(now.getTime() - date.getTime());

    const units = [
        { label: "year", milliseconds: 1000 * 60 * 60 * 24 * 365 },
        { label: "month", milliseconds: 1000 * 60 * 60 * 24 * 30 },
        { label: "week", milliseconds: 1000 * 60 * 60 * 24 * 7 },
        { label: "day", milliseconds: 1000 * 60 * 60 * 24 },
        { label: "hour", milliseconds: 1000 * 60 * 60 },
        { label: "minute", milliseconds: 1000 * 60 },
        { label: "second", milliseconds: 1000 },
    ];

    const result = [];
    for (const unit of units) {
        const amount = Math.floor(diff / unit.milliseconds);
        if (amount > 0) {
            result.push(`${amount} ${unit.label}${amount > 1 ? "s" : ""}`);
            diff -= amount * unit.milliseconds;
        }
        if (result.length === 2) break; // Limit to first 2 largest units
    }

    return result.join(" ") || "just now";

    //
}
