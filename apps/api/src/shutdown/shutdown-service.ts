import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { DbService } from "../db/db-service";
import { PgPoolService } from "../db/pg-pool-service";

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  constructor(
    private readonly dbService: DbService,
    private readonly pgPoolService: PgPoolService,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.dbService.db.$disconnect();
    await this.pgPoolService.pool.end();
  }
}
