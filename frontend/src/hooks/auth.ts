import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
    useGetApiV1IamLoginRefresh,
    useGetApiV1IamMe,
    usePostApiV1IamLogout,
} from "@/gen/endpoints/iam/iam";
import { iamKeys } from "@/utils/react-query";

import { useToast } from "./toast";

const LOGIN_TOAST_MSG_KEY = "showLoggedOutToast";

type AuthOptions = {
    onAuthFailRedirectToLogin?: boolean;

    /** If you're logged in and try to visit login/signup page and redirect to home page */
    preventPageAccessWhenLoggedIn?: boolean;
};

function useAccessToken() {
    const { data, isPending, isError } = useGetApiV1IamLoginRefresh({
        axios: { withCredentials: true },
        query: {
            queryKey: iamKeys.refreshAccessToken(),
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            refetchInterval: 8 * 1000, // 4.5 mins
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

    return { authHeader, isPending, accessToken, isError };
}

export function useAuth(opts: AuthOptions | undefined = undefined) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const { toast } = useToast();

    const { isPending, accessToken, authHeader, isError } = useAccessToken();

    const profileQuery = useGetApiV1IamMe({
        axios: { headers: authHeader, withCredentials: true },
        query: {
            queryKey: iamKeys.me(),
            enabled: accessToken !== undefined,
        },
    });

    const isLoggedIn = useMemo(
        function () {
            if (isError) return false;
            return !!accessToken && profileQuery.data?.data !== undefined;
        },
        [!!accessToken, profileQuery.data?.data !== undefined, isError],
    );

    console.log({ isLoggedIn, accessToken });

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

                if (!localStorage.getItem(LOGIN_TOAST_MSG_KEY)) {
                    toast({
                        variant: "error",
                        title: "Session Expired",
                        description: "Login to continue",
                    });

                    localStorage.setItem(LOGIN_TOAST_MSG_KEY, "toast-displayed");
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

    const onSuccess = useCallback(function (msg: string) {
        queryClient.invalidateQueries({
            queryKey: iamKeys.refreshAccessToken(),
        });

        localStorage.removeItem(LOGIN_TOAST_MSG_KEY);

        toast({
            variant: "success",
            title: "Logged In",
            description: msg,
        });
    }, []);

    return { onSuccess };
}
