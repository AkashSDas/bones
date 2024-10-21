import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/reset-password")({
    component: () => <div>Hello /auth/reset-password!</div>,
});
