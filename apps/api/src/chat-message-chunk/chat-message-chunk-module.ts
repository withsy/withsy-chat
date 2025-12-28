import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { ChatMessageChunkEntityMapper } from "./chat-message-chunk-entity-mapper.js";
import { ChatMessageChunkService } from "./chat-message-chunk-service.js";
import { ChatMessageChunkTrpcRouter } from "./chat-message-chunk-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule, DbModule, E8nModule],
  providers: [
    ChatMessageChunkTrpcRouter,
    ChatMessageChunkService,
    ChatMessageChunkEntityMapper,
  ],
  exports: [ChatMessageChunkTrpcRouter],
})
export class ChatMessageChunkModule {}
