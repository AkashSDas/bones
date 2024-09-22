import { env } from "@/utils/env";

import path from "node:path";
import pino from "pino";

export const log = pino({
    level: env.LOG_LEVEL,
    base: { pid: process.pid }, // Add process ID to logs
    timestamp: pino.stdTimeFunctions.isoTime,

    // Using transport instead of stream because is offloaded in into a separate
    // thread and thus giving more performance
    transport: {
        targets: [
            {
                target: "pino-pretty",
                options: { colorize: true, translateTime: true },
                level: env.LOG_LEVEL,
            },
            {
                target: path.resolve("./src/lib/logger/app.mjs"),
                level: env.LOG_LEVEL,
                //
                // Since using custom transport for application logs which will
                // save logs and keep on rotating log files below configs are
                // not needed. They are needed when you want to directly save
                // logs (in location - destination) and it works out of the box
                // target: "pino/file"
                // options: { destination: "./logs/app.log" },
                //
            },
            {
                target: path.resolve("./src/lib/logger/error.mjs"),
                level: "error",
            },
        ],
    },
});
