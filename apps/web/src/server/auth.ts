import type { AuthSession } from "@/common/schemas";
import type { AuthOptions, LoggerInstance } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import { inspect } from "node:util";
import { v4 } from "uuid";
import z from "zod";
import { getServerContext } from "./context";

interface AuthToken extends JWT {
  userId: string;
}

const AuthToken = z.object({
  userId: z.string(),
});

const { envVars, trpc } = getServerContext();

const providers: Provider[] = [
  GoogleProvider({
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    // authorization: {
    //   params: {
    //     prompt: "consent",
    //     access_type: "offline",
    //     response_type: "code",
    //   },
    // },
  }),
];

let logger: LoggerInstance | undefined = undefined;

if (envVars.NODE_ENV === "development") {
  const devProvider = CredentialsProvider({
    name: "Withsy Developer",
    credentials: {},
    authorize: () => {
      return {
        id: "withsy-dev",
        name: "Withsy Developer",
        email: "developer@withsy.chat",
      };
    },
  });

  providers.push(devProvider);

  logger = {
    debug: (...args) => {
      console.log("[NextAuth.js]", inspect(args, { depth: null }));
    },
    warn: (...args) => {
      console.warn("[NextAuth.js]", inspect(args, { depth: null }));
    },
    error: (...args) => {
      console.error("[NextAuth.js]", inspect(args, { depth: null }));
    },
  };
}

export const authOptions: AuthOptions = {
  providers,
  logger,
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    jwt: async (params) => {
      const { account, token, user } = params;

      // Response to `/api/auth/callback/google` request.
      if (account) {
        const { provider, providerAccountId, refresh_token } = account;
        const name = user.name ?? undefined;
        const email = user.email ?? undefined;
        const imageUrl = user.image ?? undefined;

        const { userId } = await trpc.user.login.mutate({
          idempotencyKey: v4(),
          provider,
          providerAccountId,
          refreshToken: refresh_token,
          name,
          email,
          imageUrl,
        });

        const authToken: AuthToken = {
          ...token,
          userId,
        };

        return authToken;
      }

      // Response to `/api/auth/session` request.
      return token;
    },
    session: async (params) => {
      const token = AuthToken.parse(params.token);
      const { userId } = token;

      const userPreferencesRaw = await trpc.user.getPreferences.query({
        userId,
      });

      const session: AuthSession = {
        ...params.session,
        user: {
          ...params.session.user,
          id: userId,
          preferencesRaw: userPreferencesRaw,
        },
      };

      return session;
    },
  },
};
