import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";
import { ChatMessageList, ChatMessageListOutput } from "./chat-message-schemas";
import { ChatMessageService } from "./chat-message-service";

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
    });
  }
}
