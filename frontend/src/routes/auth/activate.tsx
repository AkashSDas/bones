import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/activate")({
    component: () => <div>Hello /auth/activate!</div>,
});
