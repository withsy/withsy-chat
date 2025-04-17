import CredentialsProvider from "next-auth/providers/credentials";
import { envConfig } from "./env-config";

export const localDevAuthProvider = CredentialsProvider({
  name: "near local dev",
  credentials: {},
  authorize() {
    if (envConfig.nodeEnv !== "development") return null;
    return {
      id: "near local dev",
      name: "near local dev",
      email: "near@local.dev",
    };
  },
});
