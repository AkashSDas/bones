// https://tkdodo.eu/blog/effective-react-query-keys

/** Auth related react query keys */
export const authKeys = {
    me: (isAccessTokenPresent: boolean) => {
        return ["loggedInUser", isAccessTokenPresent] as const;
    },
    refreshAccessToken: (hasAccessTokenFailed: boolean) => {
        return ["refreshAccessToken", hasAccessTokenFailed] as const;
    },
};
