import { createFileRoute } from "@tanstack/react-router";

import { AuthProtected } from "@/components/shared/AuthProtected";

export const Route = createFileRoute("/iam/policies/$policyId/users")({
    component: () => (
        <AuthProtected>
            <IAMPolicyUsersView />
        </AuthProtected>
    ),
});

function IAMPolicyUsersView() {
    return <span>Policy Users</span>;
}
