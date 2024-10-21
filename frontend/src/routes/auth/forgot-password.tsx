import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/forgot-password")({
    component: () => <div>Hello /auth/forgot-password!</div>,
});
