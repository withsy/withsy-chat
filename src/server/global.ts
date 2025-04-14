import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import "dotenv/config";
import superjson from "superjson";
import { createServiceRegistry } from "./service-registry";

const s = createServiceRegistry();

export async function createTrpcContext({}: CreateNextContextOptions) {
  // TODO: Parse auth header.
  const { id } = await (await s.get("user")).getSeedUserId_DEV();
  return {
    s,
    userId: id,
  };
}

type TrpcContext = Awaited<ReturnType<typeof createTrpcContext>>;

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

export const tRouter = t.router;
export const tProcedure = t.procedure;
