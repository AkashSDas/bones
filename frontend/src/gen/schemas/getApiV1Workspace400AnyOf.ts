/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import type { GetApiV1Workspace400AnyOfErrors } from "./getApiV1Workspace400AnyOfErrors";

export type GetApiV1Workspace400AnyOf = {
    /** Zod Validation Errors */
    errors: GetApiV1Workspace400AnyOfErrors;
    /** Detailed error message */
    message: string;
    /** Reason for validation error */
    reason: string;
};