import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";
import {
  UserPromptData,
  UserPromptGet,
  UserPromptList,
  UserPromptListOutput,
} from "./user-prompt-schemas";
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
      get: userTrpcProcedure.procedure
        .input(UserPromptGet)
        .output(UserPromptData)
        .query(({ ctx, input }) => userPromptService.get(ctx.userId, input)),
    });
  }
}
