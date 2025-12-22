import { Module } from "@nestjs/common";
import { ApiKeyModule } from "../api-key/api-key-module";
import { DbModule } from "../db/db-module";
import { EncryptionModule } from "../encryption/encryption-module";
import { RefreshTokenModule } from "../refresh-token/refresh-token-module";
import { TrpcModule } from "../trpc/trpc-module";
import { UserService } from "./user-service";
import { UserTrpcProcedure } from "./user-trpc-procedure";
import { UserTrpcRouter } from "./user-trpc-router";

@Module({
  imports: [
    TrpcModule,
    ApiKeyModule,
    EncryptionModule,
    DbModule,
    RefreshTokenModule,
  ],
  providers: [UserTrpcRouter, UserService, UserTrpcProcedure],
  exports: [UserTrpcRouter, UserTrpcProcedure],
})
export class UserModule {}
