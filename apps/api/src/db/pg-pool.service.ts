import { Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class PgPoolService {
  private readonly logger = new Logger(PgPoolService.name);
  readonly pool: Pool;

  constructor(configService: ConfigService) {
    const pool = new Pool({
      connectionString: configService.databaseUrl,
      min: 5,
      max: 15,
    });

    const onError = (e: unknown) => {
      this.logger.error("Postgres error occurred. error:", e);
    };
    pool.on("error", onError);
    pool.on("connect", (client) => {
      client.on("error", onError);
    });

    this.pool = pool;
  }
}
