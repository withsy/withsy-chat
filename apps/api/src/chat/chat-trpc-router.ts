import { Injectable } from "@nestjs/common";
import z from "zod";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";
import {
  ChatData,
  ChatDelete,
  ChatList,
  ChatListOutput,
  ChatUpdate,
} from "./chat-schemas";
import { ChatService } from "./chat-service";

@Injectable()
export class ChatTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    chatService: ChatService,
  ) {
    this.router = trpcService.trpc.router({
      list: userTrpcProcedure.procedure
        .input(ChatList)
        .output(ChatListOutput)
        .query(({ ctx, input }) => chatService.list(ctx.userId, input)),
      update: userTrpcProcedure.procedure
        .input(ChatUpdate)
        .output(ChatData)
        .mutation(({ ctx, input }) => chatService.update(ctx.userId, input)),
      delete: userTrpcProcedure.procedure
        .input(ChatDelete)
        .output(z.void())
        .mutation(({ ctx, input }) => chatService.delete(ctx.userId, input)),
      start: userTrpcProcedure.procedure.mutation(() => {}),
    });
  }
}
