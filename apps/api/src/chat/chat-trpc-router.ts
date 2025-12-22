import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";
import { ChatList, ChatListOutput } from "./chat-schemas";
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
      start: userTrpcProcedure.procedure.mutation(() => {}),
      update: userTrpcProcedure.procedure.mutation(() => {}),
      listBranch: userTrpcProcedure.procedure.query(() => {}),
      startBranch: userTrpcProcedure.procedure.mutation(() => {}),
    });
  }
}
