// https://tkdodo.eu/blog/effective-react-query-keys

/** IAM related react query keys */
export const iamKeys = {
    me: (accessToken: string | null) => {
        return ["loggedInUser", accessToken] as const;
    },
    refreshAccessToken: (failedAccessToken: boolean) => {
        return ["refreshAccessToken", failedAccessToken] as const;
    },
    iamUsers: (
        accountId: string,
        limit: string,
        offset: string,
        search: string | undefined,
    ) => {
        return ["iamUsers", accountId, limit, offset, search];
    },
};
