import { Module } from "@nestjs/common";
import { DbModule } from "src/db/db.module";
import { TrpcModule } from "src/trpc/trpc.module";
import { ApiKeyService } from "./api-key.service";
import { ApiKeyTrpcProcedure } from "./api-key.trpc-procedure";

@Module({
  imports: [TrpcModule, DbModule],
  providers: [ApiKeyTrpcProcedure, ApiKeyService],
  exports: [ApiKeyService, ApiKeyTrpcProcedure],
})
export class ApiKeyModule {}
