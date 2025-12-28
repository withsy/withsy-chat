import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserTrpcProcedure } from "../user/user-trpc-procedure.js";
import { zAsyncIterable } from "../z-async-iterable.js";
import {
  ChatMessageChunkReceive,
  ChatMessageChunkReceiveOutput,
} from "./chat-message-chunk-entities.js";
import { ChatMessageChunkService } from "./chat-message-chunk-service.js";

@Injectable()
export class ChatMessageChunkTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    chatMessageChunkService: ChatMessageChunkService,
  ) {
    this.router = trpcService.trpc.router({
      receive: userTrpcProcedure.procedure
        .input(ChatMessageChunkReceive)
        .output(ChatMessageChunkReceiveOutput)
        .subscription(({ ctx, input }) =>
          chatMessageChunkService.receive(ctx.userId, input),
        ),
    });
  }
}
