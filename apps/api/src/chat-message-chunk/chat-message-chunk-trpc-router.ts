import { Injectable, Logger } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserTrpcProcedure } from "../user/user-trpc-procedure.js";
import {
  ChatMessageChunkReceive,
  ChatMessageChunkReceiveOutput,
} from "./chat-message-chunk-entities.js";
import { ChatMessageChunkService } from "./chat-message-chunk-service.js";

@Injectable()
export class ChatMessageChunkTrpcRouter {
  private readonly logger = new Logger(ChatMessageChunkTrpcRouter.name);
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
        .subscription(({ ctx, input, signal }) => {
          if (!signal) {
            this.logger.error("Invalid receive signal.");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          return chatMessageChunkService.receive(signal, ctx.userId, input);
        }),
    });
  }
}
