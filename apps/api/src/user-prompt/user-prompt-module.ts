import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { UserPromptService } from "./user-prompt-service";
import { UserPromptTrpcRouter } from "./user-prompt-trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserPromptTrpcRouter, UserPromptService],
  exports: [UserPromptTrpcRouter],
})
export class UserPromptModule {}
