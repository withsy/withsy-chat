import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { UserAiProfileTrpcRouter } from "./user-ai-profile-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserAiProfileTrpcRouter],
  exports: [UserAiProfileTrpcRouter],
})
export class UserAiProfileModule {}
