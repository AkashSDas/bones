import { createFileRoute } from "@tanstack/react-router";

import { AuthProtected } from "@/components/shared/AuthProtected";
import { Loader } from "@/components/shared/Loader";
import { DeinitializeWorkspace } from "@/components/workspace/home/DeinitializeWorkspace";
import { InitializeWorkspace } from "@/components/workspace/home/InitializeWorkspace";
import { StartNewWorkspaceSection } from "@/components/workspace/home/StartNewWorkspaceSection";
import { YourWorkspaceSection } from "@/components/workspace/home/YourWorkspaces";
import { useGetApiV1WorkspaceCheckInitialization } from "@/gen/endpoints/workspace/workspace";
import { useAuth } from "@/hooks/auth";
import { workspaceKeys } from "@/utils/react-query";

export const Route = createFileRoute("/workspace/")({
    component: () => (
        <AuthProtected>
            <WorkspaceHomePage />
        </AuthProtected>
    ),
});

function WorkspaceHomePage() {
    const { authHeader } = useAuth();

    const query = useGetApiV1WorkspaceCheckInitialization({
        axios: { headers: authHeader },
        query: { queryKey: workspaceKeys.checkInitialization() },
    });

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            {query.isFetching ? <Loader variant="page" /> : null}

            {query.isFetching ? null : query.data?.data.isInitialized ? (
                <>
                    <StartNewWorkspaceSection />
                    <hr className="w-full max-w-[740px] mx-auto h-px border border-grey-900" />
                    <YourWorkspaceSection />
                    <hr className="w-full max-w-[740px] mx-auto h-px border border-grey-900" />
                    <DeinitializeWorkspace />
                </>
            ) : (
                <InitializeWorkspace />
            )}
        </main>
    );
}
