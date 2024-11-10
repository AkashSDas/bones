import { createFileRoute } from "@tanstack/react-router";

// Show all of the workspace containers
export const Route = createFileRoute("/workspace/containers")({
    component: () => <div>Hello /workspace/containers!</div>,
});
