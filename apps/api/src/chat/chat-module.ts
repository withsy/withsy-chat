import { Module } from "@nestjs/common";
import { DbModule } from "../db/db-module";
import { EncryptionModule } from "../encryption/encryption-module";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { ChatDecryptor } from "./chat-decryptor";
import { ChatService } from "./chat-service";
import { ChatTrpcRouter } from "./chat-trpc-router";

@Module({
  imports: [TrpcModule, UserModule, DbModule, EncryptionModule],
  providers: [ChatTrpcRouter, ChatService, ChatDecryptor],
  exports: [ChatTrpcRouter],
})
export class ChatModule {}
