import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { UserDefaultPromptService } from "./user-default-prompt-service";
import { UserDefaultPromptTrpcRouter } from "./user-default-prompt-trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserDefaultPromptTrpcRouter, UserDefaultPromptService],
  exports: [UserDefaultPromptTrpcRouter],
})
export class UserDefaultPromptModule {}
