import { z } from "@hono/zod-openapi";
import { type Context } from "hono";
import { HTTPException } from "hono/http-exception";

import type { AppBindings, Optional } from "./types";

type StatusCode = NonNullable<ConstructorParameters<typeof HTTPException>[0]>;

export const status = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

// =====================================
// Schemas
// =====================================

const BaseHttpErrorSchema = z.object({
    reason: z.string().openapi({ description: "Reason for validation error" }),
    message: z.string().openapi({ description: "Detailed error message" }),
});

const BadRequestErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const ZodValidationErrorSchema = z
    .object({
        errors: z.record(z.string()).openapi({ description: "Zod validation errors" }),
    })
    .merge(BaseHttpErrorSchema);

const ConflictErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const UnauthorizedErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const NotFoundErrorSchema = z.object({}).merge(BaseHttpErrorSchema);

const InternalServerErrorSchema = z.object({}).merge(BaseHttpErrorSchema);

export const errorSchemas = {
    BaseHttpErrorSchema,
    BadRequestErrorSchema,
    ZodValidationErrorSchema,
    ConflictErrorSchema,
    UnauthorizedErrorSchema,
    InternalServerErrorSchema,
    NotFoundErrorSchema,

    UserBadRequestScheams: z.union([ZodValidationErrorSchema, BadRequestErrorSchema]),
};

// =====================================
// Exceptions
// =====================================

type HttpErrorOptions = {
    status: StatusCode;
    message: string;
    reason: string;
    payload?: Record<string, unknown>;
    headers?: Record<string, string>;
    cause?: unknown;
};

export class HttpError extends Error {
    public status: StatusCode;
    public reason: string;
    public payload: Record<string, unknown>;
    public headers: Record<string, string>;

    constructor(public options: HttpErrorOptions) {
        super(options.message);

        this.status = options.status;
        this.reason = options.reason;
        this.payload = options.payload ?? {};
        this.headers = options.headers ?? {};

        this.cause = options.cause;

        // Maintaining proper stack trace for debugging
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    public toJSON(c: Context<AppBindings>) {
        return c.json(
            { reason: this.reason, message: this.message, ...this.payload },
            this.status,
            this.headers,
        );
    }
}

export class BadRequestError extends HttpError {
    public status: StatusCode = status.BAD_REQUEST;
    public reason: string = "Bad Request";

    constructor(options: Optional<Omit<HttpErrorOptions, "status">, "reason">) {
        super({
            ...options,
            status: status.BAD_REQUEST,
            reason: options.reason ?? "Bad Request",
        });
    }
}

export class ZodValidationError extends BadRequestError {
    public reason: string = "Zod Validation Error";

    constructor(options: Omit<HttpErrorOptions, "status">) {
        super(options);
    }
}

export class ConflictError extends HttpError {
    public status: StatusCode = status.CONFLICT;
    public reason: string = "Conflict";

    constructor(options: Optional<Omit<HttpErrorOptions, "status">, "reason">) {
        super({
            ...options,
            status: status.CONFLICT,
            reason: options.reason ?? "Conflict",
        });
    }
}

export class InternalServerError extends HttpError {
    constructor(options: Optional<Omit<HttpErrorOptions, "status">, "reason">) {
        super({
            ...options,
            status: status.INTERNAL_SERVER_ERROR,
            reason: options.reason ?? "Internal Server Error",
        });
    }
}

export class NotFoundError extends HttpError {
    constructor(options: Optional<Omit<HttpErrorOptions, "status">, "reason">) {
        super({
            ...options,
            status: status.INTERNAL_SERVER_ERROR,
            reason: options.reason ?? "Not Found",
        });
    }
}

export class UnauthorizedError extends HttpError {
    constructor(options: Optional<Omit<HttpErrorOptions, "status">, "reason">) {
        super({
            ...options,
            status: status.UNAUTHORIZED,
            reason: options.reason ?? "Unauthorized",
        });
    }
}

// ===================================
// Common Responses
// ===================================

export const commonOpenApiResponses = {
    500: {
        description: "Internal server error",
        content: {
            "application/json": {
                schema: errorSchemas.InternalServerErrorSchema,
            },
        },
    },
};
