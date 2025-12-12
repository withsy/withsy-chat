import {
  UserDefaultPromptData,
  UserDefaultPromptGetOutput,
  UserDefaultPromptUpsert,
} from "@/types/user-default-prompt";
import { t, userProcedure } from "../trpc/server";
import { UserDefaultPromptServiceFactory } from "./user-default-prompt.service-factory";

export const userDefaultPromptRouter = t.router({
  get: userProcedure
    .output(UserDefaultPromptGetOutput)
    .query(({ ctx }) =>
      new UserDefaultPromptServiceFactory(ctx.serverContext)
        .create()
        .get({ userId: ctx.userId })
    ),
  upsert: userProcedure
    .input(UserDefaultPromptUpsert)
    .output(UserDefaultPromptData)
    .mutation(({ ctx, input }) =>
      new UserDefaultPromptServiceFactory(ctx.serverContext)
        .create()
        .upsert({ ...input, userId: ctx.userId })
    ),
});
