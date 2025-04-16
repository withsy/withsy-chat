import { envConfig } from "@/server/env-config";
import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  secret: envConfig.nextauthSecret,
  providers: [
    GithubProvider({
      clientId: envConfig.githubClientId,
      clientSecret: envConfig.githubClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("callback jwt", { token, account, profile });
      // add userId
      return token;
    },
    async session({ session, token, user }) {
      console.log("callback session", { session, token, user });
      // add userID
      return session;
    },
  },
};

export default NextAuth(authOptions);
