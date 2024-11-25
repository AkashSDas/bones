import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/$workspaceId")({
    component: () => <div>Hello /workspace/$workspaceId!</div>,
});
