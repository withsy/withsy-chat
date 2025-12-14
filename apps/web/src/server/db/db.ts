import { PrismaPg } from "@prisma/adapter-pg";
import type { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export function createDb(pgPool: Pool) {
  const adapter = new PrismaPg(pgPool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : undefined,
  });
  return client;
}

export type Db = ReturnType<typeof createDb>;
