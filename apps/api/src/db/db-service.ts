import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { inspect } from "node:util";
import { ConfigService } from "../config/config-service";
import { PrismaClient } from "../generated/prisma/client";
import { PgPoolService } from "./pg-pool-service";

export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);
  readonly db: PrismaClient;

  constructor(configService: ConfigService, pgPoolService: PgPoolService) {
    const adapter = new PrismaPg(pgPoolService.pool);
    const client = new PrismaClient({
      adapter,
      log:
        configService.nodeEnv === "development"
          ? [
              { emit: "event", level: "query" },
              { emit: "event", level: "info" },
              { emit: "event", level: "warn" },
              { emit: "event", level: "error" },
            ]
          : [{ emit: "event", level: "error" }],
    });

    client.$on("query", (ev) => {
      this.logger.log(inspect(ev, { depth: null }));
    });
    client.$on("info", (ev) => {
      this.logger.log(inspect(ev, { depth: null }));
    });
    client.$on("warn", (ev) => {
      this.logger.warn(inspect(ev, { depth: null }));
    });
    client.$on("error", (ev) => {
      this.logger.error(inspect(ev, { depth: null }));
    });

    this.db = client;
  }
}
