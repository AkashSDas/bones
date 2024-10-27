import { PropsWithChildren } from "react";

import { useAuth } from "@/hooks/auth";

import { Loader } from "./Loader";

export function AuthProtected(props: PropsWithChildren<unknown>): React.ReactNode {
    const { isLoggedIn, isLoading } = useAuth({ redirectToLoginPage: true });

    if (isLoggedIn && !isLoading) {
        return props.children;
    } else {
        return <Loader variant="page" />;
    }
}
