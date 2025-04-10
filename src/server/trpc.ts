import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
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

export const router = t.router;
export const procedure = t.procedure;

export async function createContext({}: CreateNextContextOptions) {
  // TODO: Parse auth header.
  return {
    userId: "1",
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
