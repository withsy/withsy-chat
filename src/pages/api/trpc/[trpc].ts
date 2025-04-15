import { trpcRouter } from "@/server/routers/trpc";
import { s } from "@/server/service-registry";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: trpcRouter,
  createContext: async ({}: CreateNextContextOptions) => {
    // TODO: Parse auth header.
    const { id } = await s.user.getSeedUserId_DEV();
    return {
      s,
      userId: id,
    };
  },
  onError: (opts) => {
    console.log("Trpc error occurred.", {
      type: opts.type,
      path: opts.path,
      error: opts.error,
    });
  },
});
