import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { DbHost } from "src/db/db.host";
import { PgPoolHost } from "src/db/pg-pool.host";

@Injectable()
export class ShutdownOrchestrationService implements OnApplicationShutdown {
  constructor(
    private readonly dbHost: DbHost,
    private readonly pgPoolHost: PgPoolHost
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.dbHost.db.$disconnect();
    await this.pgPoolHost.pool.end();
  }
}
