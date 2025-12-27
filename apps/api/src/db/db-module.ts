import { Module } from "@nestjs/common";
import { DbService } from "./db-service.js";
import { PgPoolService } from "./pg-pool-service.js";

@Module({
  providers: [PgPoolService, DbService],
  exports: [PgPoolService, DbService],
})
export class DbModule {}
