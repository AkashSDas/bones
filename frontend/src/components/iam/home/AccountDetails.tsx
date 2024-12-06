import { Link } from "@tanstack/react-router";

import { Button } from "@/components/shared/Button";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";
import { formatDate } from "@/utils/datetime";

import { AdminOnlyCard } from "./AdminOnlyCard";
import { Card } from "./Card";

export function AccountDetails() {
    const { account } = useAuth();
    const { toast } = useToast();

    if (account === undefined) {
        return null;
    }

    return (
        <section className="w-full max-w-[740px] mx-auto">
            <h2 className="mb-4 h3">Account</h2>

            <div className="p-4 border rounded-card border-grey-800 border-card flex flex-col gap-[14px] divide-y divide-grey-800">
                <Card
                    title="Account ID"
                    useSelectAllForDescription
                    description={account.accountId}
                    action={
                        <span className="text-sm text-grey-500">
                            Created on {formatDate(account.createdAt, "DD MMM YYYY")}
                        </span>
                    }
                />

                <Card
                    title="Account Name"
                    useSelectAllForDescription
                    description={account.accountName}
                />

                <AdminOnlyCard
                    title="Password"
                    description={`Last changed on ${formatDate(account.passwordAge, "DD MMM YYYY")}`}
                    action={
                        <Link to="/auth/forgot-password" target="_blank">
                            <Button variant="secondary">Change</Button>
                        </Link>
                    }
                />

                <AdminOnlyCard
                    title="Verification"
                    description={
                        account.lastLoggedInAt
                            ? `Last verified on ${formatDate(account.lastVerifiedAt!, "DD MMM YYYY")}`
                            : `Not verified yet`
                    }
                    action={
                        account.lastLoggedInAt ? null : (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    toast({
                                        variant: "info",
                                        title: "Support",
                                        description: `Connect with BONES support team`,
                                    });
                                }}
                            >
                                Verify
                            </Button>
                        )
                    }
                />

                <Card
                    title="IAM Permissions"
                    description="All IAM policies are managed here"
                    action={
                        <Link to="/iam/policies">
                            <Button variant="secondary">Manage</Button>
                        </Link>
                    }
                />
            </div>
        </section>
    );
}
