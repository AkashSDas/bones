import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useState } from "react";

import { Navbar } from "@/components/shared/Navbar";

export const Route = createRootRoute({
    component: Root,
});

function Root(): React.JSX.Element {
    const [queryClient] = useState(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    refetchOnMount: false,
                    retry: false,
                },
            },
        });
    });

    return (
        <QueryClientProvider client={queryClient}>
            <Navbar />
            <Outlet />
            <TanStackRouterDevtools />
        </QueryClientProvider>
    );
}
