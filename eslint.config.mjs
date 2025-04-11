import { FlatCompat } from "@eslint/eslintrc";
import safeql from "@ts-safeql/eslint-plugin/config";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // safeql.configs.connections({
  //   databaseUrl: "postgres://postgres:postgres@localhost:5432/postgres",
  //   targets: [
  //     {
  //       wrapper: { regex: "(.+queryable|qr).query" },
  //       transform: "{type}[]",
  //       fieldTransform: "camel",
  //     },
  //   ],
  //   overrides: {
  //     types: { jsonb: "unknown" },
  //     columns: {
  //       "users.preferences": "UserPreferences",
  //       "chat_messages.data": "ChatMessageData",
  //     },
  //   },
  // }),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
