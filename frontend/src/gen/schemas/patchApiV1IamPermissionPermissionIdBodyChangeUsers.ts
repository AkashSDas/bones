/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import type { PatchApiV1IamPermissionPermissionIdBodyChangeUsersChangeType } from "./patchApiV1IamPermissionPermissionIdBodyChangeUsersChangeType";
import type { PatchApiV1IamPermissionPermissionIdBodyChangeUsersPermissionType } from "./patchApiV1IamPermissionPermissionIdBodyChangeUsersPermissionType";

/**
 * Data to change users
 */
export type PatchApiV1IamPermissionPermissionIdBodyChangeUsers = {
    /** Change type */
    changeType: PatchApiV1IamPermissionPermissionIdBodyChangeUsersChangeType;
    /** Permission type */
    permissionType: PatchApiV1IamPermissionPermissionIdBodyChangeUsersPermissionType;
    /** User IDs */
    userIds: string[];
};
