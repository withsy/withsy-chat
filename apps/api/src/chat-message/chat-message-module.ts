import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { ChatMessageEntityMapper } from "./chat-message-entity-mapper";
import { ChatMessageService } from "./chat-message-service";
import { ChatMessageTrpcRouter } from "./chat-message-trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [
    ChatMessageTrpcRouter,
    ChatMessageService,
    ChatMessageEntityMapper,
  ],
  exports: [ChatMessageTrpcRouter],
})
export class ChatMessageModule {}
