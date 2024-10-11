import { z } from "@hono/zod-openapi";

const BaseHttpErrorSchema = z.object({
    reason: z.string().openapi({ description: "Reason for validation error" }),
    message: z.string().openapi({ description: "Detailed error message" }),
});

const BadRequestErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const ConflictErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const UnauthorizedErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const NotFoundErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const ForbiddenErrorSchema = z.object({}).merge(BaseHttpErrorSchema);
const InternalServerErrorSchema = z.object({}).merge(BaseHttpErrorSchema);

const ZodValidationErrorSchema = z
    .object({
        errors: z.record(z.string()).openapi({ description: "Zod Validation Errors" }),
    })
    .merge(BaseHttpErrorSchema);

/** HTTP error Zod Open API schemas */
export const HttpErrorSchemas = {
    BaseHttpErrorSchema,

    BadRequestErrorSchema,
    ConflictErrorSchema,
    NotFoundErrorSchema,
    InternalServerErrorSchema,
    UnauthorizedErrorSchema,
    ForbiddenErrorSchema,

    ZodValidationErrorSchema,

    UserBadRequestSchemas: z.union([ZodValidationErrorSchema, BadRequestErrorSchema]),
};
