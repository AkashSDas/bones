import { createFileRoute } from "@tanstack/react-router";

// Create a new workspace
export const Route = createFileRoute("/workspace/new")({
    component: () => <div>Hello /workspace/new!</div>,
});
