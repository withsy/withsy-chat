import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";
import { UserPromptList, UserPromptListOutput } from "./user-prompt-schemas";
import { UserPromptService } from "./user-prompt-service";

@Injectable()
export class UserPromptTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    userPromptService: UserPromptService,
  ) {
    this.router = trpcService.trpc.router({
      list: userTrpcProcedure.procedure
        .input(UserPromptList)
        .output(UserPromptListOutput)
        .query(({ ctx, input }) => userPromptService.list(ctx.userId, input)),
    });
  }
}
