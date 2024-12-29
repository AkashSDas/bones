// https://tkdodo.eu/blog/effective-react-query-keys

/** IAM related react query keys */
export const iamKeys = {
    /** Logged in user details */
    me() {
        return ["iam", "loggedInUser"] as const;
    },

    /** Refresh's access token */
    refreshAccessToken() {
        return ["iam", "refreshAccessToken"] as const;
    },

    /** List of IAM users in an account */
    iamUsers(limit: string, offset: string, search: string | undefined) {
        return ["iam", "iamUsers", limit, offset, search] as const;
    },

    /** IAM user */
    iamUser(userId: string) {
        return ["iam", "iamUser", userId];
    },

    /** List of IAM policies in an account */
    iamPolicies(limit: string, offset: string, search: string | undefined) {
        return ["iam", "iamPolicies", limit, offset, search] as const;
    },

    /** IAM policy */
    iamPolicy(permissionId: string) {
        return ["iam", "iamPolicy", permissionId];
    },
};

/** Workspace related react query keys */
export const workspaceKeys = {
    checkInitialization() {
        return ["workspace", "checkInitialization"] as const;
    },

    workspaces(limit: string, offset: string, search: string | undefined) {
        return ["workspace", limit, offset, search] as const;
    },
};
