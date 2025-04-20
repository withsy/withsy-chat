import { PrismaClient } from "@prisma/client";
import type { ServiceRegistry } from "../service-registry";

export function createDb(_s: ServiceRegistry) {
  const prisma = new PrismaClient();
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
  });

  return prisma;
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<
  Parameters<ReturnType<typeof createDb>["$transaction"]>[0]
>[0];
