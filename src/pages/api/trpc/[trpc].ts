import { createApiContext } from "@/server/api-context";
import { trpcRouter } from "@/server/routers/trpc";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: trpcRouter,
  createContext: async ({}: CreateNextContextOptions) => {
    return await createApiContext();
  },
  onError: (opts) => {
    console.error("Trpc error occurred.", opts.type, opts.path, opts.error);
  },
});
