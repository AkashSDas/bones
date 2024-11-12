import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // IMPORTANT: This port is required in order to make Vite-React working in the Workspace
        port: 5173,
    },
});
