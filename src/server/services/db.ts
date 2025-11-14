import { PrismaClient } from "../generated/prisma/client";
import { inject } from "../service-registry";
import { PrismaPg } from "@prisma/adapter-pg";
import { InjectableContextProvider, type InjectableContext } from "../tdi";

export class DbProvider extends InjectableContextProvider<PrismaClient> {
  provide(): InjectableContext<PrismaClient> {
    const pgPool = inject("pgPool");
    const adapter = new PrismaPg(pgPool);
    const client = new PrismaClient({ adapter });
    return {
      injectable: client,
      destroy: () => client.$disconnect(),
    };
  }
}

export type Db = PrismaClient;
export type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];
