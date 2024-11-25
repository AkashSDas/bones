import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/policies/$policyId")({
    component: () => <div>Hello /iam/policies/$policyId!</div>,
});
