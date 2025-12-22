import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { UserAiProfileTrpcRouter } from "./user-ai-profile-trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserAiProfileTrpcRouter],
  exports: [UserAiProfileTrpcRouter],
})
export class UserAiProfileModule {}
