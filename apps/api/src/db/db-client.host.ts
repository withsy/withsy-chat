import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "src/config/config.service";
import { PrismaClient } from "src/generated/prisma/client";
import { PgPoolHost } from "./pg-pool.host";

export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

@Injectable()
export class DbClientHost {
  private readonly logger = new Logger(DbClientHost.name);
  readonly client: PrismaClient;

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

    this.client = client;
  }
}
