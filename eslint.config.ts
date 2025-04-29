import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
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
  },
  ...pluginQuery.configs["flat/recommended"],
  {
    plugins: {
      "@tanstack/query": pluginQuery,
    },
    rules: {
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-unstable-deps": "error",
      "@tanstack/query/infinite-query-property-order": "error",
      "@tanstack/query/no-void-query-fn": "error",
    },
  }
);
