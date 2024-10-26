import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useGetApiV1IamMe, usePostApiV1IamLogout } from "@/gen/endpoints/iam/iam";
import { authKeys } from "@/utils/react-query";

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

    const { data, isLoading, isError } = useGetApiV1IamMe({
        axios: { headers: { ...authHeader() } },
        query: {
            queryKey: authKeys.me(token !== null),
            enabled: token !== null,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            refetchInterval: 4.5 * 60 * 1000, // 4.5 mins
        },
    });

    const isAdmin = (data?.data.roles ?? []).filter((v) => v !== "admin").length > 0;
    const isIAMUser = (data?.data.roles ?? []).filter((v) => v !== "user").length > 0;
    const isLoggedIn = data?.data.roles !== undefined;

    useEffect(
        function redirectToLogin() {
            const shouldLogout = isError || data?.status !== 200;

            if (shouldLogout && opts.redirectToLoginPage) {
                if (pathname !== "/") {
                    navigate({ to: "/auth/login" });

                    toast({
                        variant: "error",
                        title: "Session Expired",
                        description: "Login to continue",
                    });
                }
            } else if (!shouldLogout && opts.redirectToLoggedInUserHomePage) {
                navigate({ to: "/iam", replace: true });
            }
        },
        [data?.status, isError, pathname],
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
    const queryClient = useQueryClient();

    const authHeader = useAuthStore((store) => store.bearerTokenHeader);

    const mutation = usePostApiV1IamLogout({
        axios: { headers: { ...authHeader() } },
        mutation: {
            async onMutate(_variables) {
                const keys = authKeys.me(true);

                await queryClient.cancelQueries({ queryKey: keys });
                const previousData = queryClient.getQueryData(keys);

                queryClient.setQueryData(keys, () => null);

                return { previousData };
            },
        },
    });

    return {
        isPending: mutation.isPending,
        async logout() {
            navigate({ to: "/auth/login" });
            toast({
                variant: "success",
                title: "Logged Out",
                description: "Session is closed",
            });

            await mutation.mutateAsync();
        },
    };
}
