import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/policies/")({
    component: () => <div>Hello /iam/policies/!</div>,
});
