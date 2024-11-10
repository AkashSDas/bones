import { createFileRoute } from "@tanstack/react-router";

// Permissions for workspaces
export const Route = createFileRoute("/workspace/$workspaceId/permissions")({
    component: () => <div>Hello /workspace/$workspaceId/permissions!</div>,
});
