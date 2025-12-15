import { Module } from "@nestjs/common";
import { DbClientHost } from "./db-client.host";
import { PgPoolHost } from "./pg-pool.host";

@Module({
  providers: [PgPoolHost, DbClientHost],
  exports: [DbClientHost],
})
export class DbModule {}
