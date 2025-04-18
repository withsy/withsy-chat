import CredentialsProvider from "next-auth/providers/credentials";
import { envConfig } from "./env-config";

export const devAuthProvider = CredentialsProvider({
  name: "Withsy Developer",
  credentials: {},
  authorize() {
    if (envConfig.nodeEnv !== "development") return null;
    return {
      id: "withsy-dev",
      name: "Withsy Developer",
      email: "developer@withsy.chat",
    };
  },
});
