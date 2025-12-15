import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "src/config/config.service";
import { PrismaClient } from "src/generated/prisma/client";
import { PgPoolService } from "./pg-pool.service";

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

    client.$on("query", (e) => {
      this.logger.log(e);
    });
    client.$on("info", (e) => {
      this.logger.log(e);
    });
    client.$on("warn", (e) => {
      this.logger.warn(e);
    });
    client.$on("error", (e) => {
      this.logger.error(e);
    });

    this.db = client;
  }
}
