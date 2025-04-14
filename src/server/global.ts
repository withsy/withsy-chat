import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import "dotenv/config";
import superjson from "superjson";
import { initServiceMap } from "./service-map";

const s = await initServiceMap();

export async function createContext({}: CreateNextContextOptions) {
  // TODO: Parse auth heades.
  const { id } = await s.user.getSeedUserId_DEV();
  return {
    s,
    userId: id,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

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
