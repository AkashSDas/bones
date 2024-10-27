import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
    useGetApiV1IamLoginRefresh,
    useGetApiV1IamMe,
    usePostApiV1IamLogout,
} from "@/gen/endpoints/iam/iam";
import { iamKeys } from "@/utils/react-query";

import { useToast } from "./toast";

export const useAuthStore = create(
    persist<{
        accessToken: string | null;
        login: (token: string) => void;
        logout: () => void;
        bearerTokenHeader: () => {
            Authorization: `Bearer ${string}`;
        } | null;
    }>(
        function (set, get) {
            return {
                accessToken: null,
                bearerTokenHeader() {
                    if (!get().accessToken) return null;
                    return {
                        Authorization: `Bearer ${get().accessToken}`,
                    };
                },
                login(token) {
                    set({ accessToken: token });
                },
                logout() {
                    set({ accessToken: null });
                },
            };
        },
        {
            name: "auth-storage",
        },
    ),
);

/** Get logged in user details */
export function useAuth(
    opts:
        | {
              redirectToLoginPage?: boolean;
              /** So if you're on login page and user is logged in then you want to redirect the user */
              redirectToLoggedInUserHomePage?: boolean;
          }
        | undefined = {
        redirectToLoginPage: false,
        redirectToLoggedInUserHomePage: false,
    },
) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { pathname } = useLocation();

    const token = useAuthStore((store) => store.accessToken);
    const authHeader = useAuthStore((store) => store.bearerTokenHeader);
    const login = useAuthStore((store) => store.login);

    console.log({ token });
    const { data, isLoading, isError } = useGetApiV1IamMe({
        axios: { headers: { ...authHeader() } },
        query: {
            queryKey: iamKeys.me(token),
            enabled: token !== null,
        },
    });

    const refreshAccessTokenQuery = useGetApiV1IamLoginRefresh({
        axios: { withCredentials: true },
        query: {
            queryKey: iamKeys.refreshAccessToken(isError !== undefined),
            enabled: isError,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            refetchInterval: 4.5 * 60 * 1000, // 4.5 mins
        },
    });

    const isAdmin = (data?.data.roles ?? []).filter((v) => v === "admin").length > 0;
    const isIAMUser = (data?.data.roles ?? []).filter((v) => v === "user").length > 0;
    const isLoggedIn = data?.data.roles !== undefined;

    useEffect(
        function redirectToLogin() {
            const notFetchingProfile = isLoading === false;
            const notFetchingRefreshToken = refreshAccessTokenQuery.isLoading == false;

            if (
                notFetchingProfile &&
                notFetchingRefreshToken &&
                !isLoggedIn &&
                pathname !== "/" &&
                opts.redirectToLoginPage
            ) {
                navigate({ to: "/auth/login" });

                toast({
                    variant: "error",
                    title: "Session Expired",
                    description: "Login to continue",
                });
            }
        },
        [
            refreshAccessTokenQuery.isLoading,
            isLoading,
            pathname,
            opts.redirectToLoginPage,
            isLoggedIn,
        ],
    );

    useEffect(
        function redirectToHomePage() {
            // Pages like login and all should be visited by a logged in user
            const notFetchingProfile = isLoading === false;
            const notFetchingRefreshToken = refreshAccessTokenQuery.isLoading == false;

            if (
                notFetchingProfile &&
                notFetchingRefreshToken &&
                isLoggedIn &&
                opts.redirectToLoggedInUserHomePage
            ) {
                navigate({ to: "/" });
            }
        },
        [
            refreshAccessTokenQuery.isLoading,
            isLoading,
            opts.redirectToLoggedInUserHomePage,
            isLoggedIn,
        ],
    );

    useEffect(
        function syncNewAccessToken() {
            const { data, isPending } = refreshAccessTokenQuery;

            if (!isPending && data?.data.accessToken) {
                login(data.data.accessToken);
            }
        },
        [refreshAccessTokenQuery.isPending],
    );

    return {
        account: data?.data.account,
        user: data?.data.user,
        roles: data?.data.roles,
        isLoggedIn,
        isAdmin,
        isIAMUser,
        isLoading,
    };
}

export function useLogout() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const logout = useAuthStore((s) => s.logout);

    const authHeader = useAuthStore((store) => store.bearerTokenHeader);

    const mutation = usePostApiV1IamLogout({
        axios: { headers: { ...authHeader() }, withCredentials: true },
    });

    return {
        isPending: mutation.isPending,
        async logout() {
            // Due to race condition between login out in the server and remove
            // access token from store (also saved in local storage) not doing
            // optimistic logout because the access token from store is used
            // in the request that's sent and if I remove the access token
            // not request can be made to logout (as it's protected)
            await mutation.mutateAsync();
            logout();

            navigate({ to: "/auth/login" });
            toast({
                variant: "success",
                title: "Logged Out",
                description: "Session is closed",
            });
        },
    };
}
