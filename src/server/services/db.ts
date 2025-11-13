import { PrismaClient } from "../generated/prisma/client";
import { inject } from "../service-registry";
import { PrismaPg } from "@prisma/adapter-pg";

export function createDb() {
  const pgPool = inject("pgPool");
  const adapter = new PrismaPg(pgPool);
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
