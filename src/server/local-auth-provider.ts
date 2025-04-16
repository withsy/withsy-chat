import CredentialsProvider from "next-auth/providers/credentials";
import { envConfig } from "./env-config";

export const localDevAuthProvider = CredentialsProvider({
  name: "Near Local Dev",
  credentials: {},
  authorize() {
    if (envConfig.nodeEnv !== "development") return null;
    return {
      id: "Near Local Dev",
      name: "Near Local Dev",
      email: "near@local.dev",
    };
  },
});
