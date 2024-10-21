/// <reference types="vitest" />
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr(), TanStackRouterVite()],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "src/tests/setup.ts",
        include: ["src/tests/**/*.test.{ts,tsx,js,jsx}"],
        exclude: ["src/tests/e2e/**/*.test.{ts,tsx,js,jsx}"],
        coverage: {
            provider: "v8",
            include: ["src/**/*"],
            exclude: [
                "src/tests/**",
                "vite.*.ts",
                "**/*.d.ts",
                "**/*.test.{ts,tsx,js,jsx}",
                "**/*.config.*",
                "**/snapshot-tests/**",
                "**/*.solution.tsx",
                "**/coverage/**",
            ],
            all: true,
            reporter: ["text", "json", "html"],
        },
    },
});
