import { envConfig } from "@/server/env-config";
import { service } from "@/server/service-registry";
import { UserJwt, UserSession } from "@/types/user";
import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: envConfig.githubClientId,
      clientSecret: envConfig.githubClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (!account) return token;
      const { provider, providerAccountId } = account;
      const { userId } =
        await service.userLinkAccount.getOrCreateUserByProvider({
          provider,
          providerAccountId,
        });
      const userJwt = await UserJwt.parseAsync({ ...token, userId });
      return userJwt;
    },
    async session({ session, token }) {
      const userJwt = await UserJwt.parseAsync(token);
      const userSession = await UserSession.parseAsync({
        ...session,
        user: { ...(session.user ?? {}), id: userJwt.userId },
      });
      return userSession;
    },
  },
};

export default NextAuth(authOptions);
