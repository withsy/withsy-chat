import { devAuthProvider } from "@/server/dev-auth-provider";
import { envConfig } from "@/server/env-config";
import { service } from "@/server/service-registry";
import { UserJwt, UserSession } from "@/types/user";
import NextAuth, { type AuthOptions } from "next-auth";
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
];

if (envConfig.nodeEnv === "development") providers.push(devAuthProvider);

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  providers,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 1 * 24 * 60 * 60, // 1 days
  },
  callbacks: {
    async jwt(params) {
      const { token, account, profile } = params;
      if (!account) return token;

      const { provider, providerAccountId, refresh_token } = account;
      const name = profile?.name;
      const email = profile?.email;
      let image: string | undefined = undefined;
      if (profile && provider === "google") {
        image = Reflect.get(profile, "picture");
      }

      const { userId } = await service.userLinkAccount.ensure({
        provider,
        providerAccountId,
        refreshToken: refresh_token,
        name,
        email,
        image,
      });

      const userJwt = UserJwt.parse({ sub: userId });
      return userJwt;
    },
    session(params) {
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
