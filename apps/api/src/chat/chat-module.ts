import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { ChatMapper } from "./chat-mapper.js";
import { ChatService } from "./chat-service.js";
import { ChatTrpcRouter } from "./chat-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule, DbModule, E8nModule],
  providers: [ChatTrpcRouter, ChatService, ChatMapper],
  exports: [ChatTrpcRouter, ChatMapper],
})
export class ChatModule {}
