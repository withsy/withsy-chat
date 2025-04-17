import { envConfig } from "@/server/env-config";
import { localDevAuthProvider } from "@/server/local-auth-provider";
import { service } from "@/server/service-registry";
import { UserJwt, UserSession } from "@/types/user";
import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import type { Provider } from "next-auth/providers/index";

const providers: Provider[] = [
  GithubProvider({
    clientId: envConfig.githubClientId,
    clientSecret: envConfig.githubClientSecret,
  }),
];

if (envConfig.nodeEnv === "development") providers.push(localDevAuthProvider);

export const authOptions: AuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, account }) {
      if (!account) return token;
      const { provider, providerAccountId } = account;
      const { userId } =
        await service.userLinkAccount.getOrCreateUserByProvider({
          provider,
          providerAccountId,
        });
      const userJwt = UserJwt.parse({ ...token, sub: userId });
      return userJwt;
    },
    async session({ session, token }) {
      const userJwt = UserJwt.parse(token);
      const userSession = UserSession.parse({
        ...session,
        user: { ...(session.user ?? {}), id: userJwt.sub },
      });
      return userSession;
    },
  },
};

export default NextAuth(authOptions);
