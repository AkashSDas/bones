import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    test: {
        setupFiles: "src/tests/setup.ts",
        include: ["src/tests/**/*.test.{ts,tsx,js,jsx}"],
        coverage: {
            provider: "v8",
            include: ["src/**/*"],
            exclude: [
                "src/tests/**",
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
