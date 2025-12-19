import { Module } from "@nestjs/common";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserModule } from "src/user/user.module";
import { MessageTrpcRouter } from "./message.trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [MessageTrpcRouter],
  exports: [MessageTrpcRouter],
})
export class MessageModule {}
