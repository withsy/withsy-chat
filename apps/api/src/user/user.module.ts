import { Module } from "@nestjs/common";
import { ApiKeyModule } from "src/api-key/api-key.module";
import { DbModule } from "src/db/db.module";
import { EncryptionModule } from "src/encryption/encryption.module";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserService } from "./user.service";
import { UserTrpcRouter } from "./user.trpc-router";

@Module({
  imports: [TrpcModule, ApiKeyModule, EncryptionModule, DbModule],
  providers: [UserTrpcRouter, UserService],
  exports: [UserTrpcRouter],
})
export class UserModule {}
