import { Module } from "@nestjs/common";
import { DbHost } from "./db.host";
import { PgPoolHost } from "./pg-pool.host";

@Module({
  providers: [PgPoolHost, DbHost],
  exports: [DbHost],
})
export class DbModule {}
