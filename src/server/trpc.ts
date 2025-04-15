import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { ApiContext } from "./api-context";

export const t = initTRPC.context<ApiContext>().create({
  transformer: superjson,
  sse: {
    maxDurationMs: 5 * 60 * 1_000, // 5 minutes
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

export const publicProcedure = t.procedure;
