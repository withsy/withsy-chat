import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module.js";
import { EncryptionModule } from "../encryption/encryption-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserModule } from "../user/user-module.js";
import { ChatEntityMapper } from "./chat-entity-mapper.js";
import { ChatService } from "./chat-service.js";
import { ChatTrpcRouter } from "./chat-trpc-router.js";

@Module({
  imports: [TrpcModule, UserModule, DbModule, EncryptionModule],
  providers: [ChatTrpcRouter, ChatService, ChatEntityMapper],
  exports: [ChatTrpcRouter],
})
export class ChatModule {}
