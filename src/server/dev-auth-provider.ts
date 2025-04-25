import CredentialsProvider from "next-auth/providers/credentials";

export const devAuthProvider = CredentialsProvider({
  name: "Withsy Developer",
  credentials: {},
  authorize() {
    return {
      id: "withsy-dev",
      name: "Withsy Developer",
      email: "developer@withsy.chat",
    };
  },
});
