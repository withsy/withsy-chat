import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { ChatChunkEntityMapper } from "./chat-chunk-entity-mapper.js";
import { ChatChunkService } from "./chat-chunk-service.js";
import { ChatChunkTrpcRouter } from "./chat-chunk-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule, DbModule, E8nModule],
  providers: [ChatChunkTrpcRouter, ChatChunkService, ChatChunkEntityMapper],
  exports: [ChatChunkTrpcRouter],
})
export class ChatChunkModule {}
