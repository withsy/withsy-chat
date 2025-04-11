import safeql from "@ts-safeql/eslint-plugin/config";
import tseslint from "typescript-eslint";
import eslintConfig from "./eslint.config";

export default tseslint.config(
  ...eslintConfig,
  safeql.configs.connections({
    databaseUrl: "postgres://postgres:postgres@localhost:5432/postgres",
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
