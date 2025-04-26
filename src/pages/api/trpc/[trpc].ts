import { createServerContext } from "@/server/server-context";
import { appRouter } from "@/server/trpc/routers/_app";
import { UserJwt, UserSession } from "@/types/user";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../auth/[...nextauth]";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async ({ req, res }: CreateNextContextOptions) => {
    let userId = "";
    const session = await getServerSession(req, res, authOptions);
    if (session) {
      const userSession = UserSession.parse(session);
      userId = userSession.user.id;
    }

    if (!userId) {
      const token = await getToken({ req });
      if (token) {
        const userJwt = UserJwt.parse(token);
        userId = userJwt.sub;
      }
    }

    if (!userId)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication failed.",
      });

    return await createServerContext({ userId });
  },
  onError: (opts) => {
    console.error("Trpc error occurred.", opts.type, opts.path, opts.error);
  },
});
