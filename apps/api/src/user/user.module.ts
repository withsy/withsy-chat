import { Module } from "@nestjs/common";
import { ApiKeyModule } from "src/api-key/api-key.module";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserService } from "./user.service";
import { UserTrpcRouter } from "./user.trpc-router";

@Module({
  imports: [TrpcModule, ApiKeyModule],
  providers: [UserTrpcRouter, UserService],
  exports: [UserTrpcRouter],
})
export class UserModule {}
