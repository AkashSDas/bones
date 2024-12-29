import {
    useGetApiV1WorkspaceCheckInitialization,
    usePostApiV1WorkspaceInitialize,
} from "@/gen/endpoints/workspace/workspace";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";
import { workspaceKeys } from "@/utils/react-query";

import { Button } from "../../shared/Button";
import { Loader } from "../../shared/Loader";

export function InitializeWorkspace() {
    const { authHeader } = useAuth();
    const { toast } = useToast();

    const query = useGetApiV1WorkspaceCheckInitialization({
        axios: { headers: authHeader },
        query: { queryKey: workspaceKeys.checkInitialization() },
    });

    const initializeMutation = usePostApiV1WorkspaceInitialize({
        axios: { headers: authHeader },
        mutation: {
            async onSuccess() {
                toast({
                    title: "Done",
                    description: "Workspace service initialized for account",
                    variant: "success",
                });

                await query.refetch();
            },
        },
    });

    return (
        <section className="w-full max-w-[740px] mx-auto flex flex-col gap-1">
            <h2 className="h3">Initialize Workspace</h2>
            <p className="text-sm text-grey-500">
                Initialize workspace for your account. This will allow you to create
                workspaces and manage them.
            </p>

            <Button
                onClick={() => initializeMutation.mutateAsync()}
                disabled={initializeMutation.isPending}
                className="mt-4 max-w-44"
            >
                {initializeMutation.isPending && <Loader />}

                {initializeMutation.isPending
                    ? "Initializing..."
                    : "Initialize Workspace"}
            </Button>
        </section>
    );
}
