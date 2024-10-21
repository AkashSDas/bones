import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage(): React.JSX.Element {
    return (
        <main>
            <h1>Bones Project</h1>
        </main>
    );
}
