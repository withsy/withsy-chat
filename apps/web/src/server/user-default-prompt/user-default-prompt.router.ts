import {
  UserDefaultPromptData,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import { t, userProcedure } from "../trpc/server";
import { UserDefaultPromptServiceFactory } from "./user-default-prompt.service-factory";

export const userDefaultPromptRouter = t.router({
  get: userProcedure
    .output(UserDefaultPromptData)
    .query(({ ctx }) =>
      new UserDefaultPromptServiceFactory(ctx.serverContext)
        .create()
        .get({ userId: ctx.userId })
    ),
  update: userProcedure
    .input(UserDefaultPromptUpdate)
    .output(UserDefaultPromptData)
    .mutation(({ ctx, input }) =>
      new UserDefaultPromptServiceFactory(ctx.serverContext)
        .create()
        .update({ ...input, userId: ctx.userId })
    ),
});
