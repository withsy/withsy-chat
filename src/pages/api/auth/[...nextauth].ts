import { devAuthProvider } from "@/server/dev-auth-provider";
import { envConfig } from "@/server/env-config";
import { service } from "@/server/service-registry";
import { UserJwt, UserSession } from "@/types/user";
import NextAuth, { type AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";

const providers: Provider[] = [
  GoogleProvider({
    clientId: envConfig.googleClientId,
    clientSecret: envConfig.googleClientSecret,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
      },
    },
  }),
  GithubProvider({
    clientId: envConfig.githubClientId,
    clientSecret: envConfig.githubClientSecret,
  }),
];

if (envConfig.nodeEnv === "development") providers.push(devAuthProvider);

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  providers,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hours
  },
  callbacks: {
    async jwt(params) {
      const { token, account } = params;
      if (!account) return token;
      const { provider, providerAccountId, refresh_token } = account;
      const { userId } = await service.userLinkAccount.ensureUserByAccount({
        provider,
        providerAccountId,
        refreshToken: refresh_token,
      });
      const userJwt = UserJwt.parse({ ...token, sub: userId });
      return userJwt;
    },
    async session(params) {
      const { token, session } = params;
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
