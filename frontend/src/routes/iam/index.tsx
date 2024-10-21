import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iam/")({
    component: () => <div>Hello /iam/!</div>,
});
