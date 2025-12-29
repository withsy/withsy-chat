import { Injectable, Logger } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserTrpcProcedure } from "../user/user-trpc-procedure.js";
import {
  ChatChunkReceive,
  ChatChunkReceiveOutput,
} from "./chat-chunk-entities.js";
import { ChatChunkService } from "./chat-chunk-service.js";

@Injectable()
export class ChatChunkTrpcRouter {
  readonly #logger = new Logger(ChatChunkTrpcRouter.name);
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    chatChunkService: ChatChunkService,
  ) {
    this.router = trpcService.trpc.router({
      receive: userTrpcProcedure.procedure
        .input(ChatChunkReceive)
        .output(ChatChunkReceiveOutput)
        .subscription(({ ctx, input, signal }) => {
          if (!signal) {
            this.#logger.error("Invalid receive signal.");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          return chatChunkService.receive(signal, ctx.userId, input);
        }),
    });
  }
}
