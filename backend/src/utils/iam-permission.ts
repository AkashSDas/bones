import { type IAMPolicy } from "@/schemas/iam-permission";

export class IAMPolicyManager {
    constructor() {}

    // =====================================
    // IAM
    // =====================================

    /**
     * This is a workspace service wide policy for an account. By default only admin has
     * all the permissions, and read/write for all the users are not there by default.
     **/
    static buildIAMServicePolicy(): IAMPolicy["IAMService"] {
        return {
            readAll: false,
            writeAll: false,
            readForUsers: [],
            writeForUsers: [],
        };
    }

    // =====================================
    // Workspace
    // =====================================

    /**
     * This is a workspace service wide policy for an account. By default only admin has
     * all the permissions, and read/write for all the users are not there by default.
     **/
    static buildWorkspaceServicePolicy(): IAMPolicy["WorkspaceService"] {
        return {
            readAll: false,
            writeAll: false,
            readForUsers: [],
            writeForUsers: [],
        };
    }

    /**
     * This is an individual workspace policy. By default only admin has all the
     * permissions, and given user has read/write permissions.
     **/
    static buildWorkspacePolicy(userIds: string[]): IAMPolicy["Workspace"] {
        return {
            readAll: false,
            writeAll: false,
            readForUsers: userIds,
            writeForUsers: userIds,
        };
    }
}
