// https://tkdodo.eu/blog/effective-react-query-keys

/** IAM related react query keys */
export const iamKeys = {
    /** Logged in user details */
    me() {
        return ["loggedInUser"] as const;
    },

    /** Refresh's access token */
    refreshAccessToken() {
        return ["refreshAccessToken"] as const;
    },

    /** List of IAM users in an account */
    iamUsers(limit: string, offset: string, search: string | undefined) {
        return ["iamUsers", limit, offset, search] as const;
    },

    /** IAM user */
    iamUser(userId: string) {
        return ["iamUser", userId];
    },

    /** List of IAM policies in an account */
    iamPolicies(limit: string, offset: string, search: string | undefined) {
        return ["iamPolicies", limit, offset, search] as const;
    },
};
