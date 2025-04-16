import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { ServerContext } from "../server-context";

export const t = initTRPC.context<ServerContext>().create({
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
