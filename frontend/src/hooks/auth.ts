import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";

import {
    useGetApiV1IamLoginRefresh,
    useGetApiV1IamMe,
    usePostApiV1IamLogout,
} from "@/gen/endpoints/iam/iam";
import { iamKeys } from "@/utils/react-query";

import { useToast } from "./toast";

export const useAuthStore = create<{
    showLoggedOutToast: boolean;
    refreshTokenHasFailed: boolean;
    setShowLoggedOutToast: (v: boolean) => void;
    setRefreshTokenHasFailed: (v: boolean) => void;
}>(function (set) {
    return {
        showLoggedOutToast: true,
        refreshTokenHasFailed: false,
        setShowLoggedOutToast(v) {
            set(() => ({ showLoggedOutToast: v }));
        },
        setRefreshTokenHasFailed(v) {
            set(() => ({ refreshTokenHasFailed: v }));
        },
    };
});

type AuthOptions = {
    onAuthFailRedirectToLogin?: boolean;

    /** If you're logged in and try to visit login/signup page and redirect to home page */
    preventPageAccessWhenLoggedIn?: boolean;
};

function useAccessToken() {
    const refreshTokenHasFailed = useAuthStore((s) => s.refreshTokenHasFailed);

    const { data, isLoading, isLoadingError, isRefetchError } =
        useGetApiV1IamLoginRefresh({
            axios: { withCredentials: true },
            query: {
                queryKey: iamKeys.refreshAccessToken(),
                refetchOnReconnect: true,
                refetchOnWindowFocus: true,
                refetchInterval: 4.5 * 1000, // 4.5 mins
                enabled: !refreshTokenHasFailed,
            },
        });

    const accessToken = data?.data.accessToken;

    const authHeader = useMemo(
        function () {
            if (accessToken === undefined) {
                return {};
            } else {
                return {
                    Authorization: `Bearer ${accessToken}`,
                };
            }
        },
        [accessToken],
    );

    return {
        authHeader,
        isPending: isLoading,
        accessToken,
        isError: isLoadingError || isRefetchError,
    };
}

export function useAuth(opts: AuthOptions | undefined = undefined) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const { toast } = useToast();

    const { isPending, accessToken, authHeader, isError } = useAccessToken();

    const showLoggedOutToast = useAuthStore((s) => s.showLoggedOutToast);
    const setShowLoggedOutToast = useAuthStore((s) => s.setShowLoggedOutToast);
    const setRefreshTokenHasFailed = useAuthStore((s) => s.setRefreshTokenHasFailed);
    const refreshTokenHasFailed = useAuthStore((s) => s.refreshTokenHasFailed);

    const profileQuery = useGetApiV1IamMe({
        axios: { headers: authHeader, withCredentials: true },
        query: {
            queryKey: iamKeys.me(),
            enabled: accessToken !== undefined && !refreshTokenHasFailed,
        },
    });

    const isLoggedIn = useMemo(
        function () {
            if (isError) {
                setRefreshTokenHasFailed(true);
                return false;
            } else {
                return !!accessToken && profileQuery.data?.data !== undefined;
            }
        },
        [!!accessToken, profileQuery.data?.data !== undefined, isError],
    );

    const isAdmin = useMemo(
        function () {
            const roles = profileQuery.data?.data.roles ?? [];
            return roles.find((v) => v === "admin") !== undefined;
        },
        [isLoggedIn],
    );

    const isIAMUser = useMemo(
        function () {
            const roles = profileQuery.data?.data.roles ?? [];
            return roles.find((v) => v === "user") !== undefined;
        },
        [isLoggedIn],
    );

    const queryClient = useQueryClient();

    useEffect(
        function redirectToLoginPageOnAuthFail() {
            if (!isLoggedIn) {
                queryClient.removeQueries({ queryKey: iamKeys.me() });

                if (showLoggedOutToast) {
                    queryClient.removeQueries({
                        queryKey: iamKeys.refreshAccessToken(),
                    });

                    toast({
                        variant: "error",
                        title: "Session Expired",
                        description: "Login to continue",
                    });

                    setShowLoggedOutToast(false);
                }

                if (pathname !== "/" && opts?.onAuthFailRedirectToLogin) {
                    navigate({ to: "/auth/login" });
                }
            }
        },
        [isLoggedIn],
    );

    useEffect(
        function redirectToHome() {
            if (isLoggedIn && opts?.preventPageAccessWhenLoggedIn) {
                navigate({ to: "/" });
            }
        },
        [isLoggedIn],
    );

    return {
        account: profileQuery.data?.data.account,
        user: profileQuery.data?.data.user,
        roles: profileQuery.data?.data.roles,
        isLoggedIn,
        isLoading: isPending,
        isAdmin,
        isIAMUser,
        authHeader,
    };
}

export function useLogout() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const { authHeader } = useAuth();

    const queryClient = useQueryClient();

    const mutation = usePostApiV1IamLogout({
        axios: { headers: authHeader, withCredentials: true },
    });

    const logout = useCallback(function () {
        (async () => {
            await mutation.mutateAsync();

            queryClient.removeQueries({ queryKey: iamKeys.refreshAccessToken() });
            queryClient.removeQueries({ queryKey: iamKeys.me() });

            navigate({ to: "/auth/login" });
            toast({
                variant: "success",
                title: "Logged Out",
                description: "Session is closed",
            });
        })();
    }, []);

    return {
        logout,
        isPending: mutation.isPending,
    };
}

export function useOnLogin() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const setShowLoggedOutToast = useAuthStore((s) => s.setShowLoggedOutToast);
    const setRefreshTokenHasFailed = useAuthStore((s) => s.setRefreshTokenHasFailed);

    const onSuccess = useCallback(async function (msg: string) {
        await queryClient.invalidateQueries({ queryKey: iamKeys.refreshAccessToken() });
        await queryClient.invalidateQueries({ queryKey: iamKeys.me() });

        setShowLoggedOutToast(true);
        setRefreshTokenHasFailed(false);

        toast({
            variant: "success",
            title: "Logged In",
            description: msg,
        });
    }, []);

    return { onSuccess };
}
