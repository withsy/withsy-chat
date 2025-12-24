import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc-module";
import { UserModule } from "../user/user-module";
import { MessageEntityMapper } from "./message-entity-mapper";
import { MessageService } from "./message-service";
import { MessageTrpcRouter } from "./message-trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [MessageTrpcRouter, MessageService, MessageEntityMapper],
  exports: [MessageTrpcRouter],
})
export class MessageModule {}
