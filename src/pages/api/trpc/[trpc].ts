import { createServerContext } from "@/server/server-context";
import { appRouter } from "@/server/trpc/routers/_app";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async ({ req, res }: CreateNextContextOptions) => {
    return await createServerContext({ req, res });
  },
  onError: (opts) => {
    console.error("Trpc error occurred.", opts.type, opts.path, opts.error);
  },
});
