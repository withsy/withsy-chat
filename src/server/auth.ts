import { service } from "@/server/service-registry";
import { UserJwt, UserSession } from "@/types/user";
import { type AuthOptions, type LoggerInstance } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import { inspect } from "node:util";

let _authOptions: AuthOptions | null = null;

function initAuthOptions() {
  const providers: Provider[] = [
    GoogleProvider({
      clientId: service.env.googleClientId,
      clientSecret: service.env.googleClientSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ];

  const devAuthProvider = CredentialsProvider({
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

  if (service.env.nodeEnv === "development") providers.push(devAuthProvider);

  const logger: LoggerInstance = {
    debug(code, metadata) {
      console.info(
        "[next-auth] debug",
        "code:",
        code,
        "metadata:",
        inspect(metadata, { depth: null })
      );
    },
    error(code, metadata) {
      console.info(
        "[next-auth] error",
        "code:",
        code,
        "metadata:",
        inspect(metadata, { depth: null })
      );
    },
    warn(code) {
      console.info("[next-auth] warn", "code:", code);
    },
  };

  _authOptions = {
    logger: service.env.nodeEnv === "production" ? undefined : logger,
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
        let imageUrl: string | undefined = undefined;
        if (profile && provider === "google") {
          imageUrl = Reflect.get(profile, "picture");
        }

        const { userId } = await service.userLinkAccount.ensure({
          provider,
          providerAccountId,
          refreshToken: refresh_token,
          name,
          email,
          imageUrl,
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
}

export function getAuthOptions(): AuthOptions {
  if (!_authOptions) initAuthOptions();
  if (!_authOptions) throw new Error("Uninitialized auth options.");
  return _authOptions;
}
