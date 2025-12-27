import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { UserDefaultPromptService } from "./user-default-prompt-service.js";
import { UserDefaultPromptTrpcRouter } from "./user-default-prompt-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserDefaultPromptTrpcRouter, UserDefaultPromptService],
  exports: [UserDefaultPromptTrpcRouter],
})
export class UserDefaultPromptModule {}
