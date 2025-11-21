import { createPublicContext } from "@/server/server-context";
import { appRouter } from "@/server/app/app-router";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async ({ req, res }) => {
    return await createPublicContext({ request: req, response: res });
  },
  onError: (opts) => {
    console.error("Trpc error occurred.", opts.type, opts.path, opts.error);
  },
});
