import { Module } from "@nestjs/common";
import { ApiKeyModule } from "../api-key/api-key-module.js";
import { DbModule } from "../db/db-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserEntityMapper } from "./user-entity-mapper.js";
import { UserService } from "./user-service.js";
import { UserTrpcProcedure } from "./user-trpc-procedure.js";
import { UserTrpcRouter } from "./user-trpc-router.js";

@Module({
  imports: [TrpcModule, ApiKeyModule, DbModule],
  providers: [UserTrpcRouter, UserService, UserTrpcProcedure, UserEntityMapper],
  exports: [UserTrpcRouter, UserTrpcProcedure],
})
export class UserModule {}
