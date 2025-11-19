import {
  UserDefaultPromptData,
  UserDefaultPromptGetOutput,
  UserDefaultPromptUpdate,
} from "@/types/user-default-prompt";
import { t, userProcedure } from "../trpc/server";

export const userDefaultPromptRouter = t.router({
  get: userProcedure
    .output(UserDefaultPromptGetOutput)
    .query(({ ctx }) =>
      ctx.serviceRegistry.userDefaultPromptService
        .get(ctx.userId)
        .then((x) => UserDefaultPromptGetOutput.parse(x))
    ),
  update: userProcedure
    .input(UserDefaultPromptUpdate)
    .output(UserDefaultPromptData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.userDefaultPromptService
        .update(ctx.userId, input)
        .then((x) => UserDefaultPromptData.parse(x))
    ),
});
