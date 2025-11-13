import { PrismaClient } from "../generated/prisma/client";
import type { ServiceRegistry } from "../service-registry";
import { PrismaPg } from "@prisma/adapter-pg";

export function createDb(_s: ServiceRegistry) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
  });

  return prisma;
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<
  Parameters<ReturnType<typeof createDb>["$transaction"]>[0]
>[0];
