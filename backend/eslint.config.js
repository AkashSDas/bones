import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "dist",
            "coverage",
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
        languageOptions: {
            ecmaVersion: 2020,
        },
        plugins: {
            eslintPluginPrettier,
        },
        rules: {
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
        },
    },
);
