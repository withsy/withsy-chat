import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat-module.js";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { ChatMessageMapper } from "./chat-message-mapper.js";
import { ChatMessageService } from "./chat-message-service.js";
import { ChatMessageTrpcRouter } from "./chat-message-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule, DbModule, E8nModule, ChatModule],
  providers: [ChatMessageTrpcRouter, ChatMessageService, ChatMessageMapper],
  exports: [ChatMessageTrpcRouter],
})
export class ChatMessageModule {}
