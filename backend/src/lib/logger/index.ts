import { env } from "@/utils/env";

import { AsyncLocalStorage } from "node:async_hooks";
import path from "node:path";
import pino from "pino";

// Create an instance of AsyncLocalStorage for context storage
const asyncLocalStorage = new AsyncLocalStorage();

// Helper function to extract stack trace details
function getStackInfo() {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const obj: Record<string, any> = {};
    Error.captureStackTrace(obj, getStackInfo);
    const stack = obj?.stack?.split("\n");

    // Skip frames to get to the actual call site
    const callerFrame = stack[4]?.trim(); // Adjust this to skip more frames
    const match = callerFrame?.match(/\(([^)]+)\)/); // Extract the part between parentheses

    if (match && match[1]) {
        const parts = match[1].split(":");
        const filename = parts[0].split("/").pop();
        const lineno = parts[1];
        const funcName = callerFrame.split(" ")[1];
        return { filename, lineno, funcName };
    }

    return { filename: "unknown", lineno: "unknown", funcName: "anonymous" };
}

class Logger {
    private logInstance: pino.Logger;

    constructor() {
        this.logInstance = pino({
            level: env.LOG_LEVEL,
            base: { pid: process.pid },
            transport: {
                targets: [
                    {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: false,
                            messageFormat: `[{timestamp}] [{correlationId}] [{requestId}] [{logLevel}] [{filename}:{lineno} -> {funcName}()] {msg}`,
                            ignore: "pid,hostname,timestamp,level,time,lineno,correlationId,requestId,funcName,filename,logLevel",
                        },
                        level: env.LOG_LEVEL,
                    },
                    {
                        target: path.resolve("./src/lib/logger/app.mjs"),
                        level: env.LOG_LEVEL,
                    },
                    {
                        target: path.resolve("./src/lib/logger/error.mjs"),
                        level: "error",
                    },
                ],
            },
        });
    }

    getContext(level: pino.Level) {
        const { filename, lineno, funcName } = getStackInfo();

        // Retrieve the context from AsyncLocalStorage
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const context: any = asyncLocalStorage.getStore() ?? {};
        const { correlationId = "N/A", requestId = "N/A" } = context;

        return {
            timestamp: new Date().toISOString(),
            correlationId,
            requestId,
            logLevel: level.toUpperCase(), // Different name from "level" as it breaks logging
            filename,
            lineno,
            funcName,
        };
    }

    formatError(err: Error) {
        const stack = err.stack || "";
        return `\n${err.message}\nStack Trace: ${stack}\nDetails: ${this.stringifyError(err)}`;
    }

    // Safely stringify an object, handling circular references and deeply nested structures
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    stringifyError(obj: any) {
        const seen = new WeakSet();
        return JSON.stringify(
            obj,
            (_key, value) => {
                if (value && typeof value === "object") {
                    if (seen.has(value)) {
                        return "[Circular]"; // Avoid circular references
                    }
                    seen.add(value);
                }
                return value;
            },
            2, // Indent for readability
        );
    }

    // Handle falsy values like null, undefined, and 0
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    handleFalsyValues(msg: any) {
        if (msg === null) return "null";
        if (msg === undefined) return "undefined";
        if (msg === "") return '""';
        if (msg === 0) return "0";
        if (typeof msg === "object" && Object.keys(msg).length === 0) {
            return "{}";
        }
        return msg;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    log(level: pino.Level, msg: any) {
        const data = this.getContext(level);

        if (msg instanceof Error) {
            this.logInstance[level](data, this.formatError(msg));
        } else if (typeof msg === "object" && msg !== null) {
            this.logInstance[level](data, `\n${this.stringifyError(msg)}`);
        } else {
            this.logInstance[level](data, this.handleFalsyValues(msg));
        }
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    info(msg: any) {
        this.log("info", msg);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    debug(msg: any) {
        this.log("debug", msg);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    error(msg: any) {
        this.log("error", msg);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    warn(msg: any) {
        this.log("warn", msg);
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    fatal(msg: any) {
        this.log("fatal", msg);
    }
}

const log = new Logger();

export { log, asyncLocalStorage };
