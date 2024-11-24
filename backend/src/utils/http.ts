import { type Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { HttpErrorSchemas } from "@/schemas/http";

import type { AppBindings, Optional } from "./types";

type StatusCode = NonNullable<ConstructorParameters<typeof HTTPException>[0]>;

/** HTTP status code */
export const status = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    REDIRECT: 302,
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

/** Common Zod Open API response utility */
export const OpenApiResponses = {
    protectedRoute: {
        [status.UNAUTHORIZED]: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.UnauthorizedErrorSchema,
                },
            },
        },
        [status.INTERNAL_SERVER_ERROR]: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.InternalServerErrorSchema,
                },
            },
        },
    },
    rbacProtectedRoute: {
        [status.UNAUTHORIZED]: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.UnauthorizedErrorSchema,
                },
            },
        },
        [status.NOT_FOUND]: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.NotFoundErrorSchema,
                },
            },
        },
        [status.FORBIDDEN]: {
            description: "Forbidden",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.ForbiddenErrorSchema,
                },
            },
        },
        [status.INTERNAL_SERVER_ERROR]: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.InternalServerErrorSchema,
                },
            },
        },
    },
    protectedAndValidationRoute: {
        [status.UNAUTHORIZED]: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.UnauthorizedErrorSchema,
                },
            },
        },
        [status.INTERNAL_SERVER_ERROR]: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.InternalServerErrorSchema,
                },
            },
        },
        [status.BAD_REQUEST]: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.UserBadRequestSchemas,
                },
            },
        },
    },
    publicRoute: {
        [status.INTERNAL_SERVER_ERROR]: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.InternalServerErrorSchema,
                },
            },
        },
    },
    publicAndValidationRoute: {
        [status.INTERNAL_SERVER_ERROR]: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.InternalServerErrorSchema,
                },
            },
        },
        [status.BAD_REQUEST]: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: HttpErrorSchemas.UserBadRequestSchemas,
                },
            },
        },
    },
};

// =====================================
// Exceptions
// =====================================

type HttpErrorOptions = {
    status: StatusCode;
    message?: string;
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

    constructor(
        options: Optional<Omit<HttpErrorOptions, "status">, "reason" | "message">,
    ) {
        super({
            ...options,
            status: status.BAD_REQUEST,
            message: options.message ?? "Bad Request",
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

    constructor(
        options: Optional<Omit<HttpErrorOptions, "status">, "reason" | "message">,
    ) {
        super({
            ...options,
            status: status.CONFLICT,
            reason: options.reason ?? "Conflict",
            message: options.message ?? "Conflict",
        });
    }
}

export class InternalServerError extends HttpError {
    constructor(
        options: Optional<Omit<HttpErrorOptions, "status">, "reason" | "message">,
    ) {
        super({
            ...options,
            status: status.INTERNAL_SERVER_ERROR,
            reason: options.reason ?? "Internal Server Error",
        });
    }
}

export class NotFoundError extends HttpError {
    constructor(
        options: Optional<Omit<HttpErrorOptions, "status">, "reason" | "message">,
    ) {
        super({
            ...options,
            status: status.NOT_FOUND,
            reason: options.reason ?? "Not Found",
            message: options.message ?? "Not Found",
        });
    }
}

export class ForbiddenError extends HttpError {
    constructor(
        options: Optional<Omit<HttpErrorOptions, "status">, "reason" | "message">,
    ) {
        super({
            ...options,
            status: status.FORBIDDEN,
            reason: options.reason ?? "Forbidden",
            message: options.message ?? "Forbidden",
        });
    }
}

export class UnauthorizedError extends HttpError {
    constructor(
        options: Optional<Omit<HttpErrorOptions, "status">, "reason" | "message">,
    ) {
        super({
            ...options,
            status: status.UNAUTHORIZED,
            reason: options.reason ?? "Unauthorized",
            message: options.message ?? "Unauthorized",
        });
    }
}
