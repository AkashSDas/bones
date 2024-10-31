import { useAuth } from "@/hooks/auth";

import { Card, type CardProps } from "./Card";

export function AdminOnlyCard(props: CardProps): React.JSX.Element | null {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return null;
    }

    return <Card {...props} />;
}
