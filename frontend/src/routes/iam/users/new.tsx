import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/users/new")({
    component: () => <div>Hello /iam/users/new!</div>,
});
