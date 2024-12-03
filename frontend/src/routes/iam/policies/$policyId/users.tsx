import { createFileRoute } from "@tanstack/react-router";

import { PolicyUsers } from "@/components/iam-permission/PolicyUsers";
import { AuthProtected } from "@/components/shared/AuthProtected";

export const Route = createFileRoute("/iam/policies/$policyId/users")({
    component: () => (
        <AuthProtected>
            <IAMPolicyUsersView />
        </AuthProtected>
    ),
});

function IAMPolicyUsersView() {
    const { policyId } = Route.useParams();

    return <PolicyUsers policyId={policyId} />;
}
