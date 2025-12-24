import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module";
import { EncryptionModule } from "../encryption/encryption-module";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { ChatEntityMapper } from "./chat-entity-mapper";
import { ChatService } from "./chat-service";
import { ChatTrpcRouter } from "./chat-trpc-router";

@Module({
  imports: [TrpcModule, UserModule, DbModule, EncryptionModule],
  providers: [ChatTrpcRouter, ChatService, ChatEntityMapper],
  exports: [ChatTrpcRouter],
})
export class ChatModule {}
