import type { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export type Db = PrismaClient;
export type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];

export function createDb(pgPool: Pool): Db {
  const adapter = new PrismaPg(pgPool);
  const client = new PrismaClient({ adapter });
  return client;
}
