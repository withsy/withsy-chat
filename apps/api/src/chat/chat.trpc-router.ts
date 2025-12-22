import { Injectable } from "@nestjs/common";
import { TrpcService } from "src/trpc/trpc.service";
import { UserTrpcProcedure } from "src/user/user.trpc-procedure";
import { ChatList, ChatListOutput } from "./chat-schemas";
import { ChatService } from "./chat.service";

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
        .query(({ input }) => chatService.list(input)),
      start: userTrpcProcedure.procedure.mutation(() => {}),
      update: userTrpcProcedure.procedure.mutation(() => {}),
      listBranch: userTrpcProcedure.procedure.query(() => {}),
      startBranch: userTrpcProcedure.procedure.mutation(() => {}),
    });
  }
}
