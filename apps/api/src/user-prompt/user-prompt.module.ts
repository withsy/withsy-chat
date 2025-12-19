import { Module } from "@nestjs/common";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserModule } from "src/user/user.module";
import { UserPromptTrpcRouter } from "./user-prompt.trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [UserPromptTrpcRouter],
  exports: [UserPromptTrpcRouter],
})
export class UserPromptModule {}
