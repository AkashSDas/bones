import { createStream } from "rotating-file-stream";
import { ulid } from "ulid";

/**
 * Pads a number to ensure it is two digits (e.g., 5 becomes '05').
 *
 * @param {number} num - The number to pad.
 * @returns {string} - The padded string.
 */
function padTime(num) {
    return (num > 9 ? "" : "0") + num;
}

/**
 * Log file name generator function.
 * Generates a log file name based on the current date, time, and a unique identifier (ULID).
 *
 * @param {Date|null} time - The current time. If null, the current date/time will be used.
 * @param {number} _idx - Index of the log rotation (unused).
 * @returns {string} - The generated log file name in the format: DD:MM:YYYYTHH:MMSS-ULID.gz.
 */
function logGenerator(time, _idx) {
    if (!(time instanceof Date)) {
        time = new Date(Date.now());
    }

    const day = padTime(time.getDate()); // DD
    const month = padTime(time.getMonth() + 1); // MM
    const year = time.getFullYear(); // YYYY
    const hour = padTime(time.getHours()); // HH
    const minute = padTime(time.getMinutes()); // MM
    const seconds = padTime(time.getSeconds()); // SS

    const uniqueId = ulid(); // Generate ULID

    return `${day}:${month}:${year}T${hour}:${minute}${seconds}-${uniqueId}.gz`;
}

const stream = createStream(logGenerator, {
    interval: "1d",
    size: "10M",
    path: "./logs/error",
    compress: "gzip",
});

export default function errorLogStream() {
    return stream;
}
