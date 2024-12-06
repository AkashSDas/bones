import { Link, createFileRoute } from "@tanstack/react-router";

import { AuthProtected } from "@/components/shared/AuthProtected";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { WorkspaceIDE } from "@/components/workspace/ide/WorkspaceIDE";
import { useGetApiV1WorkspaceWorkspaceId } from "@/gen/endpoints/workspace/workspace";
import { useAuth } from "@/hooks/auth";

export const Route = createFileRoute("/workspace/$workspaceId")({
    component: function () {
        return (
            <AuthProtected>
                <Workspace />
            </AuthProtected>
        );
    },
});

function Workspace() {
    const { workspaceId } = Route.useParams();

    const { authHeader } = useAuth();

    const query = useGetApiV1WorkspaceWorkspaceId(workspaceId, {
        axios: { headers: authHeader },
    });

    const status = query.data?.status;
    const hasAccess = status === 200;
    const forbidden = status === 403;

    return (
        <main className="w-full max-w-[1440px]">
            {query.isLoading ? <Loader variant="page" /> : null}

            {forbidden ? (
                <section className="my-14 flex justify-between items-center mx-auto max-w-[740px] w-full">
                    <h3 className="h3">Forbidden</h3>

                    <Link to="/workspace">
                        <Button>Go to workspaces</Button>
                    </Link>
                </section>
            ) : null}

            {hasAccess ? <WorkspaceIDE workspaceId={workspaceId} /> : null}
        </main>
    );
}
