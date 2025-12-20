import { Module } from "@nestjs/common";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserModule } from "src/user/user.module";
import { ChatMessageTrpcRouter } from "./chat-message.trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [ChatMessageTrpcRouter],
  exports: [ChatMessageTrpcRouter],
})
export class ChatMessageModule {}
