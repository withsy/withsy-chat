import { Module } from "@nestjs/common";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserModule } from "src/user/user.module";
import { ChatService } from "./chat.service";
import { ChatTrpcRouter } from "./chat.trpc-router";

@Module({
  imports: [TrpcModule, UserModule],
  providers: [ChatTrpcRouter, ChatService],
  exports: [ChatTrpcRouter],
})
export class ChatModule {}
