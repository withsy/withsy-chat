import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;

export async function createContext({}: CreateNextContextOptions) {
  // TODO: Parse auth header.
  return {
    userId: "1",
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
