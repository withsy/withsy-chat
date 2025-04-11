import "dotenv/config";

import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { EventEmitter } from "node:stream";
import superjson from "superjson";
import { Db } from "./db/core";
import { External } from "./external/core";

export const db = new Db();
export const ext = new External();

// TODO: move to pg or redis.
export const ee = new EventEmitter();

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
  const { userId } = await db.users.getSeedUserId_DEV();
  return {
    userId,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
