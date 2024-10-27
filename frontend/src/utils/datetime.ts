export function formatDate(
    dateStr: string,
    formatType:
        | "DD MMM YYYY"
        | "MMM DD, YYYY"
        | "YYYY-MM-DD"
        | "MM/DD/YYYY"
        | "fullDateTime",
): string {
    const date = new Date(dateStr);

    const day = date.getUTCDate().toString().padStart(2, "0");
    const monthShort = date.toLocaleString("en-GB", {
        month: "short",
        timeZone: "UTC",
    });
    const monthNumber = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();

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

        default:
            return "Invalid format type";
    }
}
