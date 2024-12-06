import { useDeleteApiV1WorkspaceDeinitialize } from "@/gen/endpoints/workspace/workspace";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";

import { Button } from "../../shared/Button";
import { Loader } from "../../shared/Loader";

export function DeinitializeWorkspace() {
    const { authHeader } = useAuth();
    const { toast } = useToast();

    const deinitializeMutation = useDeleteApiV1WorkspaceDeinitialize({
        axios: { headers: authHeader },
        mutation: {
            onSuccess() {
                toast({
                    title: "Done",
                    description: "Workspace service deinitialized for account",
                    variant: "success",
                });
            },
        },
    });

    return (
        <section className="w-full max-w-[740px] mx-auto flex flex-col gap-1">
            <h2 className="h3">Deinitialize Workspace</h2>

            <p className="text-sm text-grey-500 max-w-[600px]">
                Stop workspace service for your account. This will disable the ability
                to create workspaces and manage them. Also, it will delete all of the
                resources created by the workspace service.
            </p>

            <p className="text-sm text-grey-500">
                Note that it will take some time reflect this change.
            </p>

            <Button
                variant="error"
                onClick={() => deinitializeMutation.mutateAsync()}
                disabled={deinitializeMutation.isPending}
                className="mt-4 max-w-44"
            >
                {deinitializeMutation.isPending && <Loader />}

                {deinitializeMutation.isPending
                    ? "Deinitializing..."
                    : "Deinitialize Workspace"}
            </Button>
        </section>
    );
}
