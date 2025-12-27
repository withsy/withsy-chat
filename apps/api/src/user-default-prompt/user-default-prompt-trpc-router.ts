import { Injectable } from "@nestjs/common";
import z from "zod";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserTrpcProcedure } from "../user/user-trpc-procedure.js";
import { UserDefaultPromptTryGetOutput } from "./user-default-prompt-schemas.js";
import { UserDefaultPromptService } from "./user-default-prompt-service.js";

@Injectable()
export class UserDefaultPromptTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    userDefaultPromptService: UserDefaultPromptService,
  ) {
    this.router = trpcService.trpc.router({
      tryGet: userTrpcProcedure.procedure
        .input(z.void())
        .output(UserDefaultPromptTryGetOutput)
        .query(({ ctx }) => userDefaultPromptService.tryGet(ctx.userId)),
    });
  }
}
