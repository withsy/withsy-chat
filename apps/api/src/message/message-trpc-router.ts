import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";
import { MessageList, MessageListOutput } from "./message-schemas";
import { MessageService } from "./message-service";

@Injectable()
export class MessageTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    messageService: MessageService,
  ) {
    this.router = trpcService.trpc.router({
      list: userTrpcProcedure.procedure
        .input(MessageList)
        .output(MessageListOutput)
        .query(({ ctx, input }) => messageService.list(ctx.userId, input)),
      regenerateReply: userTrpcProcedure.procedure.mutation(() => {}),
      update: userTrpcProcedure.procedure.mutation(() => {}),
    });
  }
}
