import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { DbClientHost } from "src/db/db-client.host";
import { PgPoolHost } from "src/db/pg-pool.host";

@Injectable()
export class ShutdownOrchestrationService implements OnApplicationShutdown {
  constructor(
    private readonly dbClientHost: DbClientHost,
    private readonly pgPoolHost: PgPoolHost
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.dbClientHost.client.$disconnect();
    await this.pgPoolHost.pool.end();
  }
}
