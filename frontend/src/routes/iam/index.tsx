import { createFileRoute } from "@tanstack/react-router";

import { AccountDetails } from "@/components/iam/home/AccountDetails";
import { IAMUserDetails } from "@/components/iam/home/IAMUserDetails";
import { IAMUsersDetails } from "@/components/iam/home/IAMUsersDetails";
import { AuthProtected } from "@/components/shared/AuthProtected";
import { useAuth } from "@/hooks/auth";

export const Route = createFileRoute("/iam/")({
    component: () => (
        <AuthProtected>
            <IAMHomePage />
        </AuthProtected>
    ),
});

function IAMHomePage(): React.JSX.Element {
    const { isAdmin, isIAMUser } = useAuth();

    return (
        <main className="my-5 md:my-6 px-4 md:py-8 mx-auto w-full max-w-[1440px] space-y-4 md:space-y-12">
            <AccountDetails />
            {isIAMUser ? <IAMUserDetails /> : null}
            {isAdmin ? <IAMUsersDetails /> : null}
        </main>
    );
}
