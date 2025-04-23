import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { TrpcDataError } from "../error";
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
  errorFormatter: ({ error, shape }) => {
    if (error.cause instanceof TrpcDataError) {
      return {
        ...shape,
        data: error.cause.data,
      };
    }

    return shape;
  },
});

export const publicProcedure = t.procedure;
