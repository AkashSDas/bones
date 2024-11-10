import { createFileRoute } from "@tanstack/react-router";

// Workspace settings
export const Route = createFileRoute("/workspace/$workspaceId/settings")({
    component: () => <div>Hello /workspace/$workspaceId/settings!</div>,
});
