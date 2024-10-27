import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/users/")({
    component: () => <div>Hello /iam/users/!</div>,
});
