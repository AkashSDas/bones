import { Link, createFileRoute } from "@tanstack/react-router";
import { UsersIcon } from "lucide-react";

import { PolicyUpdateForm } from "@/components/iam-permission/PolicyUpdateForm";
import { AuthProtected } from "@/components/shared/AuthProtected";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { useGetApiV1IamPermissionPermissionId } from "@/gen/endpoints/iam-permission/iam-permission";
import { useAuth } from "@/hooks/auth";
import { iamKeys } from "@/utils/react-query";

export const Route = createFileRoute("/iam/policies/$policyId/")({
    component: () => (
        <AuthProtected>
            <IAMPolicyDetails />
        </AuthProtected>
    ),
});

function IAMPolicyDetails() {
    const { policyId } = Route.useParams();

    const { authHeader } = useAuth();

    const query = useGetApiV1IamPermissionPermissionId(policyId, {
        axios: { headers: authHeader },
        query: { queryKey: iamKeys.iamPolicy(policyId) },
    });

    const data = query.data?.data;

    return (
        <main className="my-5 md:my-6 px-8 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            <section className="w-full max-w-[740px] mx-auto mb-20">
                {!query.isLoading && data === undefined ? (
                    <div className="flex flex-col gap-1 my-4 w-full">
                        <h2 className="h3">Policy</h2>

                        <div className="flex justify-between items-center w-full">
                            <p className="text-grey-400">Policy not found</p>

                            <Link to="/iam/policies">
                                <Button className="w-fit">See other policies</Button>
                            </Link>
                        </div>
                    </div>
                ) : null}

                {query.isLoading ? <Loader variant="page" /> : null}

                {data?.permission ? (
                    <>
                        <PolicyUpdateForm permission={data.permission} />
                        <hr className="my-16 border border-grey-800" />

                        <Link to="/iam/policies/$policyId/users" params={{ policyId }}>
                            <Button className="w-fit" variant="secondary">
                                <UsersIcon /> See users associated with this policy
                            </Button>
                        </Link>
                    </>
                ) : null}
            </section>
        </main>
    );
}
