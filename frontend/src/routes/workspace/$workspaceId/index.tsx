import { createFileRoute } from "@tanstack/react-router";

// Individual workspace
export const Route = createFileRoute("/workspace/$workspaceId/")({
    component: () => <div>Hello /workspace/$workspaceId/!</div>,
});
