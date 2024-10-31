import { createFileRoute, getRouteApi, useNavigate } from "@tanstack/react-router";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import type React from "react";
import { useEffect } from "react";
import { z } from "zod";

import Logo from "@/assets/svgs/logo.svg?react";
import { Loader } from "@/components/shared/Loader";
import { useToast } from "@/hooks/toast";

const SearchSchema = z.object({
    /** Account activation status */
    status: fallback(z.enum(["success", "failed"]), "failed").default("failed"),
});

const routeApi = getRouteApi("/auth/activate");

export const Route = createFileRoute("/auth/activate")({
    component: ActivateAccountPage,
    validateSearch: zodSearchValidator(SearchSchema),
});

function ActivateAccountPage(): React.JSX.Element {
    const { status } = routeApi.useSearch();
    const navigate = useNavigate({ from: "/auth/activate" });
    const { toast } = useToast();

    useEffect(
        function handleRedirection() {
            switch (status) {
                case "success":
                    navigate({ to: "/auth/login" });
                    toast({
                        variant: "success",
                        title: "Account Activated",
                        description: "Account is successfully activated",
                    });
                    break;
                default:
                    navigate({ to: "/auth/login" });
                    toast({
                        variant: "error",
                        title: "Link invalid/expired",
                        description: "Login in to your account and try again",
                    });
                    break;
            }
        },
        [status],
    );

    return (
        <main className="my-14 md:my-10 items-center px-4 flex flex-col gap-12 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <Logo className="w-[75.96px] h-[46.29px] md:h-[61.73px] md:w-[101.27px]" />
            <h1 className="h2">Activating Account</h1>
            <Loader sizeInPx={40} />
        </main>
    );
}
