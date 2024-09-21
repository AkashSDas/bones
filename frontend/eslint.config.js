import eslint from "@eslint/js";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "dist",
            "coverage",
            "playwright-report",
            "node_modules",
            "package-lock.json",
            "pnpm-lock.yaml",
        ],
    },
    {
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            eslintPluginPrettier,
        ],
        files: ["**/*.{ts,tsx}"],
        settings: {
            react: {
                version: "detect",
            },
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            react,
            eslintPluginPrettier,
            "@tanstack/query": tanstackQuery,
        },
        rules: {
            // React
            ...reactHooks.configs.recommended.rules,
            ...react.configs.recommended.rules,
            "react/react-in-jsx-scope": "off", // Not needed with React 17+
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react-refresh/only-export-components": "error",

            // TypeScript
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            // Prettier
            "prettier/prettier": "warn",

            // Tanstack Query
            ...tanstackQuery.configs.recommended.rules,
            "@tanstack/query/exhaustive-deps": "warn",
            "@tanstack/query/no-deprecated-options": "error",
            "@tanstack/query/prefer-query-object-syntax": "error",
            "@tanstack/query/stable-query-client": "error",
        },
    },
);
