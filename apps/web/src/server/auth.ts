import type { AuthOptions, LoggerInstance } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import { inspect } from "node:util";
import { v4 } from "uuid";
import { getServerContext } from "./context";

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

        return {
          ...token,
          userId,
        };
      }

      // Response to `/api/auth/session` request.
      return token;
    },
    session: async (params) => {
      const { token, session } = params;

      const { userId } = token;
      if (!userId) {
        throw new Error("User id not found.");
      }

      const userPreferences = await trpc.user.getPreferences.query({
        userId: String(userId),
      });

      session.user ??= {};
      Reflect.set(session.user, "id", userId);
      Reflect.set(session.user, "preferences", userPreferences);

      return session;
    },
  },
};
