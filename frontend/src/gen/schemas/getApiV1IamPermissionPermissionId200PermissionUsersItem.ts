/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import type { GetApiV1IamPermissionPermissionId200PermissionUsersItemAccessType } from "./getApiV1IamPermissionPermissionId200PermissionUsersItemAccessType";

export type GetApiV1IamPermissionPermissionId200PermissionUsersItem = {
    accessType: GetApiV1IamPermissionPermissionId200PermissionUsersItemAccessType;
    createdAt: string;
    isBlocked: boolean;
    lastLoggedInAt: string;
    passwordAge: string;
    updatedAt: string;
    userId: string;
    /** @maxLength 255 */
    username: string;
};
