import { createFileRoute } from "@tanstack/react-router";

import { IAMUsersDialog } from "@/components/iam/permission/IAMUsersDialog";
import { PolicyUsers } from "@/components/iam/permission/PolicyUsers";
import { AuthProtected } from "@/components/shared/AuthProtected";
import { Dialog } from "@/components/shared/Dialog";
import { useGetApiV1IamPermissionPermissionId } from "@/gen/endpoints/iam-permission/iam-permission";
import { useAuth } from "@/hooks/auth";
import { iamKeys } from "@/utils/react-query";

export const Route = createFileRoute("/iam/policies/$policyId/users")({
    component: () => (
        <AuthProtected>
            <IAMPolicyUsersView />
        </AuthProtected>
    ),
});

function IAMPolicyUsersView() {
    const { policyId } = Route.useParams();

    const { authHeader } = useAuth();

    const query = useGetApiV1IamPermissionPermissionId(policyId, {
        axios: { headers: authHeader },
        query: { queryKey: iamKeys.iamPolicy(policyId) },
    });

    const data = query.data?.data;
    const users = data?.permission.users ?? [];

    return (
        <Dialog>
            <PolicyUsers policyId={policyId} />
            <IAMUsersDialog
                permissionId={policyId}
                excludeUsers={users.map((u) => {
                    return {
                        accessType: u.accessType,
                        userId: u.userId,
                    };
                })}
            />
        </Dialog>
    );
}
