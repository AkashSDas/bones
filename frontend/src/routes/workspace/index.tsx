import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/")({
    component: () => <div>Hello /workspace/!</div>,
});
