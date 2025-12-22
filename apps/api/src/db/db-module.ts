import { Module } from "@nestjs/common";
import { DbService } from "./db-service";
import { PgPoolService } from "./pg-pool-service";

@Module({
  providers: [PgPoolService, DbService],
  exports: [PgPoolService, DbService],
})
export class DbModule {}
