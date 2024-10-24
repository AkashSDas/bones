import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import type React from "react";
import { z } from "zod";

import Logo from "@/assets/svgs/logo.svg?react";
import { Loader } from "@/components/shared/Loader";

const QuerySchema = z.object({
    token: fallback(z.string(), "").default(""),
});

const routeApi = getRouteApi("/auth/activate");

export const Route = createFileRoute("/auth/activate")({
    component: ActivateAccountPage,
    validateSearch: zodSearchValidator(QuerySchema),
    beforeLoad(ctx) {
        console.log(ctx.search);
    },
});

function ActivateAccountPage(): React.JSX.Element {
    const routeSearch = routeApi.useSearch();

    return (
        <main className="my-14 md:my-10 items-center px-4 flex flex-col gap-12 md:py-8 mx-auto w-full max-w-[680px] space-y-4 md:space-y-4">
            <Logo className="w-[75.96px] h-[46.29px] md:h-[61.73px] md:w-[101.27px]" />
            <h1 className="h2">Activating Account</h1>
            <Loader sizeInPx={92} />
        </main>
    );
}
