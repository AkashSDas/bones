import { Link } from "@tanstack/react-router";

import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { useGetApiV1IamUser } from "@/gen/endpoints/iam-user/iam-user";
import { useAuth, useAuthStore } from "@/hooks/auth";
import { iamKeys } from "@/utils/react-query";

import { Card } from "./Card";

export function IAMUsersDetails() {
    const authHeader = useAuthStore((s) => s.bearerTokenHeader);
    const { account } = useAuth();
    const query = useGetApiV1IamUser(
        { limit: "1" },
        {
            axios: { headers: { ...authHeader() } },
            query: {
                initialData: undefined,
                queryKey: iamKeys.iamUsers(account!.accountId, "1", "0", undefined),
            },
        },
    );

    const dataLoaded = query.data !== undefined;

    return (
        <section className="w-full max-w-[740px] mx-auto">
            <h2 className="mb-4 h3">IAM User</h2>

            <div className="p-4 transition-height border rounded-card border-grey-800 border-card flex flex-col gap-[14px] divide-y divide-grey-800">
                {query.isLoading || query.isFetching ? (
                    <Loader variant="section" />
                ) : null}

                {dataLoaded ? (
                    <>
                        <Card
                            title="Total IAM Users"
                            description={`There are ${query.data.data.total} IAM users`}
                            action={
                                <Link to="/iam/users">
                                    <Button variant="secondary">See all</Button>
                                </Link>
                            }
                        />

                        <Card
                            title="New IAM User"
                            description={`Create a new user for this account`}
                            action={
                                <Link to="/iam/users/new">
                                    <Button variant="secondary">Add</Button>
                                </Link>
                            }
                        />
                    </>
                ) : null}
            </div>
        </section>
    );
}
