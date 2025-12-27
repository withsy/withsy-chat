import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserTrpcProcedure } from "../user/user-trpc-procedure.js";
import {
  ChatMessageList,
  ChatMessageListOutput,
  ChatMessageSend,
  ChatMessageSendOutput,
} from "./chat-message-schemas.js";
import { ChatMessageService } from "./chat-message-service.js";

@Injectable()
export class ChatMessageTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    chatMessageService: ChatMessageService,
  ) {
    this.router = trpcService.trpc.router({
      list: userTrpcProcedure.procedure
        .input(ChatMessageList)
        .output(ChatMessageListOutput)
        .query(({ ctx, input }) => chatMessageService.list(ctx.userId, input)),
      update: userTrpcProcedure.procedure.mutation(() => {}),
      send: userTrpcProcedure.procedure
        .input(ChatMessageSend)
        .output(ChatMessageSendOutput)
        .mutation(({ ctx, input }) =>
          chatMessageService.send(ctx.userId, input),
        ),
    });
  }
}
