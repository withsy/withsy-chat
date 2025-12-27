import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { UserPromptService } from "./user-prompt-service.js";
import { UserPromptTrpcRouter } from "./user-prompt-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserPromptTrpcRouter, UserPromptService],
  exports: [UserPromptTrpcRouter],
})
export class UserPromptModule {}
