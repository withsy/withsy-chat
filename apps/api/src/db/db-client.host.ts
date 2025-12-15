import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "src/config/config.service";
import { PrismaClient } from "src/generated/prisma/client";
import { PgPoolHost } from "./pg-pool.host";

@Injectable()
export class DbClientHost {
  readonly client: PrismaClient;

  constructor(configService: ConfigService, pgPoolHost: PgPoolHost) {
    const adapter = new PrismaPg(pgPoolHost.pool);

    this.client = new PrismaClient({
      adapter,
      log: configService.nodeEnv === "development" ? ["query"] : undefined,
    });
  }
}
