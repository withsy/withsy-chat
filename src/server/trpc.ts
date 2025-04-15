import type { UserId } from "@/types/user";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type ServiceRegistry } from "./service-registry";

type TrpcContext = {
  s: ServiceRegistry;
  userId: UserId;
};

export const t = initTRPC.context<TrpcContext>().create({
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
