import { Module } from "@nestjs/common";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserModule } from "src/user/user.module";
import { UserDefaultPromptTrpcRouter } from "./user-default-prompt.trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserDefaultPromptTrpcRouter],
  exports: [UserDefaultPromptTrpcRouter],
})
export class UserDefaultPromptModule {}
