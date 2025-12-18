import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { inspect } from "node:util";
import { ConfigService } from "src/config/config.service";
import { PrismaClient } from "src/generated/prisma/client";
import { PgPoolHost } from "./pg-pool.host";

export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

@Injectable()
export class DbHost {
  private readonly logger = new Logger(DbHost.name);
  readonly db: PrismaClient;

  constructor(configService: ConfigService, pgPoolHost: PgPoolHost) {
    const adapter = new PrismaPg(pgPoolHost.pool);
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
