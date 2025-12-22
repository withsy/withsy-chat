import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { MessageTrpcRouter } from "./message-trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [MessageTrpcRouter],
  exports: [MessageTrpcRouter],
})
export class MessageModule {}
