import { Button } from "@/components/shared/Button";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/toast";
import { formatDate } from "@/utils/datetime";

import { Card } from "./Card";

export function IAMUserDetails() {
    const { user } = useAuth();
    const { toast } = useToast();

    if (user === undefined) {
        return null;
    }

    return (
        <section className="w-full max-w-[740px] mx-auto">
            <h2 className="mb-4 h3">IAM User</h2>

            <div className="p-4 border rounded-card border-grey-800 border-card flex flex-col gap-[14px] divide-y divide-grey-800">
                <Card
                    title="User ID"
                    useSelectAllForDescription
                    description={user.userId}
                    action={
                        <span className="text-sm text-grey-500">
                            Created on {formatDate(user.createdAt, "DD MMM YYYY")}
                        </span>
                    }
                />

                <Card title="Username" description={user.username} />

                <Card
                    title="Password"
                    description={`Last changed on ${formatDate(user.passwordAge, "DD MMM YYYY")}`}
                    action={
                        <Button
                            variant="secondary"
                            onClick={() => {
                                toast({
                                    variant: "info",
                                    title: "Administrator Needed",
                                    description: `Connect with your administrator to update password`,
                                });
                            }}
                        >
                            Change
                        </Button>
                    }
                />
            </div>
        </section>
    );
}
