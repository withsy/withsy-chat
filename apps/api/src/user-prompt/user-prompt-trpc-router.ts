import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserTrpcProcedure } from "../user/user-trpc-procedure.js";
import {
  UserPromptData,
  UserPromptGet,
  UserPromptList,
  UserPromptListOutput,
} from "./user-prompt-schemas.js";
import { UserPromptService } from "./user-prompt-service.js";

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
