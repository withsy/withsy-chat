import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { ApiKeyService } from "./api-key-service.js";
import { ApiKeyTrpcProcedure } from "./api-key-trpc-procedure.js";

@Module({
  imports: [TrpcModule, DbModule],
  providers: [ApiKeyTrpcProcedure, ApiKeyService],
  exports: [ApiKeyService, ApiKeyTrpcProcedure],
})
export class ApiKeyModule {}
