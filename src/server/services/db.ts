import { PrismaClient } from "../generated/prisma/client";
import { inject } from "../service-registry";
import { PrismaPg } from "@prisma/adapter-pg";

export type Db = PrismaClient;
export type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];

export function createDb(): Db {
  const pgPool = inject("pgPool");
  const adapter = new PrismaPg(pgPool);
  const client = new PrismaClient({ adapter });
  return client;
}
