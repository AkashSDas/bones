/// <reference types="vitest" />
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { type PluginOption, UserConfig, defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
    const plugins: PluginOption[] = [];
    const isDev = mode === "development";

    if (isDev) {
        plugins.push(
            TanStackRouterVite({
                autoCodeSplitting: true,
                quoteStyle: "double",
            }),
        );

        plugins.push(
            visualizer({
                filename: "stats.html",
                open: true,
            }),
        );
    }

    plugins.push(react()); // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    plugins.push(svgr());

    return {
        plugins,
        resolve: {
            alias: {
                "@": "/src",
            },
        },
        optimizeDeps: {
            esbuildOptions: {
                plugins: [importMetaUrlPlugin as any],
            },
        },
        test: {
            globals: true,
            watch: false,
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
    };
});
