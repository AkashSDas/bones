import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/users/$userId")({
    component: () => <div>Hello /iam/$userId!</div>,
});
