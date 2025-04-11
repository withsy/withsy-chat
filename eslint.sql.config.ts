import safeql from "@ts-safeql/eslint-plugin/config";
import tseslint from "typescript-eslint";
import eslintConfig from "./eslint.config";

export default tseslint.config(
  ...eslintConfig,
  safeql.configs.connections({
    migrationsDir: "migrations",
    targets: [
      {
        wrapper: { regex: "(.+queryable|qr).query" },
        transform: "{type}[]",
        fieldTransform: "camel",
      },
    ],
    overrides: {
      types: { jsonb: "unknown" },
      columns: {
        "users.preferences": "UserPreferences",
        "chat_messages.data": "ChatMessageData",
      },
    },
  })
);
