import { UserJwt, UserSession } from "@/types/user";
import { type AuthOptions, type LoggerInstance } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import { inspect } from "node:util";
import { serviceRegistry } from "./service-registry";

function createAuthOptions(): AuthOptions {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Invalid GOOGLE_CLIENT_ID.");
  }

  if (!GOOGLE_CLIENT_SECRET) {
    throw new Error("Invalid GOOGLE_CLIENT_SECRET.");
  }

  const providers: Provider[] = [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ];

  if (process.env.NODE_ENV !== "production") {
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

    providers.push(devAuthProvider);
  }

  const authOptions: AuthOptions = {
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

        const { userId } = await serviceRegistry.userLinkAccountService.ensure({
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

  const devLogger: LoggerInstance = {
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

  if (process.env.NODE_ENV !== "production") {
    authOptions.logger = devLogger;
  }

  return authOptions;
}

let authOptions: AuthOptions | null = null;

export function getAuthOptions(): AuthOptions {
  if (!authOptions) {
    authOptions = createAuthOptions();
  }
  return authOptions;
}
