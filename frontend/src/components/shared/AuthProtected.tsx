import { Link } from "@tanstack/react-router";
import { PropsWithChildren } from "react";

import { type GetApiV1IamMe200 } from "@/gen/schemas";
import { useAuth } from "@/hooks/auth";

import { Button } from "./Button";
import { Loader } from "./Loader";

type Props = {
    forRoles?: GetApiV1IamMe200["roles"];
};

export function AuthProtected(props: PropsWithChildren<Props>): React.ReactNode {
    const { isLoggedIn, isLoading, roles } = useAuth({
        onAuthFailRedirectToLogin: true,
    });

    if (isLoggedIn && !isLoading && roles !== undefined) {
        if (props.forRoles) {
            const permissions = props.forRoles.filter(
                (v) => roles.find((r) => v === r) !== undefined,
            );

            if (permissions.length === props.forRoles.length) {
                return props.children;
            } else {
                return (
                    <section className="flex flex-col items-center justify-center gap-6 my-16">
                        <p className="text-xl font-medium">
                            {"You don't have permission"}
                        </p>

                        <Link to="/">
                            <Button>Go to home</Button>
                        </Link>
                    </section>
                );
            }
        } else {
            return props.children;
        }
    } else {
        return <Loader variant="page" />;
    }
}
