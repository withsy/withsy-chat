import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from "@tanstack/eslint-plugin-query";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["tailwind.config.js"]),
  ...new FlatCompat({
    baseDirectory: import.meta.dirname,
  }).extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/server/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  }
);
