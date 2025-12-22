import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module";
import { TrpcModule } from "../trpc/trpc-module";
import { ApiKeyService } from "./api-key-service";
import { ApiKeyTrpcProcedure } from "./api-key-trpc-procedure";

@Module({
  imports: [TrpcModule, DbModule],
  providers: [ApiKeyTrpcProcedure, ApiKeyService],
  exports: [ApiKeyService, ApiKeyTrpcProcedure],
})
export class ApiKeyModule {}
