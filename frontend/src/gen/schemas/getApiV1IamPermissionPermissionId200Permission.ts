/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import type { GetApiV1IamPermissionPermissionId200PermissionServiceType } from "./getApiV1IamPermissionPermissionId200PermissionServiceType";
import type { GetApiV1IamPermissionPermissionId200PermissionUsersItem } from "./getApiV1IamPermissionPermissionId200PermissionUsersItem";

export type GetApiV1IamPermissionPermissionId200Permission = {
    createdAt: string;
    isServiceWide: boolean;
    /** @maxLength 255 */
    name: string;
    permissionId: string;
    readAll: boolean;
    serviceType: GetApiV1IamPermissionPermissionId200PermissionServiceType;
    updatedAt: string;
    users: GetApiV1IamPermissionPermissionId200PermissionUsersItem[];
    writeAll: boolean;
};
