import { createServerContext } from "@/server/server-context";
import { trpcRouter } from "@/server/trpc/router";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default trpcNext.createNextApiHandler({
  router: trpcRouter,
  createContext: async ({ req, res }: CreateNextContextOptions) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication failed.",
      });

    return await createServerContext(session);
  },
  onError: (opts) => {
    console.error("Trpc error occurred.", opts.type, opts.path, opts.error);
  },
});
