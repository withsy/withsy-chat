import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { ChatMessageEntityMapper } from "./chat-message-entity-mapper.js";
import { ChatMessageService } from "./chat-message-service.js";
import { ChatMessageTrpcRouter } from "./chat-message-trpc-router.js";

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
