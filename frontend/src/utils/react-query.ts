// https://tkdodo.eu/blog/effective-react-query-keys

/** Auth related react query keys */
export const authKeys = {
    me: (accessToken: string | null) => {
        return ["loggedInUser", accessToken] as const;
    },
    refreshAccessToken: (failedAccessToken: boolean) => {
        return ["refreshAccessToken", failedAccessToken] as const;
    },
};
