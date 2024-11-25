import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/policies/users")({
    component: () => <div>Hello /iam/policies/users!</div>,
});
