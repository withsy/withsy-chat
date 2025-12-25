import { Module } from "@nestjs/common";
import { ApiKeyModule } from "../api-key/api-key-module";
import { DbModule } from "../db/db-module";
import { TrpcModule } from "../trpc/trpc-module";
import { UserEntityMapper } from "./user-entity-mapper";
import { UserService } from "./user-service";
import { UserTrpcProcedure } from "./user-trpc-procedure";
import { UserTrpcRouter } from "./user-trpc-router";

@Module({
  imports: [TrpcModule, ApiKeyModule, DbModule],
  providers: [UserTrpcRouter, UserService, UserTrpcProcedure, UserEntityMapper],
  exports: [UserTrpcRouter, UserTrpcProcedure],
})
export class UserModule {}
