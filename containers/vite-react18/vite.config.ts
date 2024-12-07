import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // By default it uses "localhost" and it creates issue in workspace Nginx config
        // because there 127.0.0.1 is used. Also, the port forwarding which happens
        // via 127.0.0.1. If we want to use localhost as host then we'll have to use
        // the "--host" flag while starting Vite server, but then it will cause issue
        // in port forward, hence not recommended
        host: "127.0.0.1",
        port: 5173,
    },
});
