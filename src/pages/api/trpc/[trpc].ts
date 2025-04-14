import { createTrpcContext } from "@/server/global";
import { trpcRouter } from "@/server/routers/trpc";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: trpcRouter,
  createContext: createTrpcContext,
});
