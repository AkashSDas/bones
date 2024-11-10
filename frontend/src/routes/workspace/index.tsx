import { createFileRoute } from "@tanstack/react-router";

// Root page for workspace
// - option for create new workspace
// - option to view all workspaces
export const Route = createFileRoute("/workspace/")({
    component: () => <div>Hello /workspace/!</div>,
});
