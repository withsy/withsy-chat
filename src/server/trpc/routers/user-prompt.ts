import {
  UserPromptCreate,
  UserPromptData,
  UserPromptDelete,
  UserPromptGet,
  UserPromptListOutput,
  UserPromptRestore,
  UserPromptUpdate,
} from "@/types/user-prompt";
import { publicProcedure, t } from "../server";

export const userPromptRouter = t.router({
  get: publicProcedure
    .input(UserPromptGet)
    .output(UserPromptData)
    .query(({ ctx, input }) =>
      ctx.diContainer
        .get("userPromptService")
        .get(ctx.userId, input)
        .then((x) => UserPromptData.parse(x))
    ),
  list: publicProcedure.output(UserPromptListOutput).query(({ ctx }) =>
    ctx.diContainer
      .get("userPromptService")
      .list(ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  listDeleted: publicProcedure.output(UserPromptListOutput).query(({ ctx }) =>
    ctx.diContainer
      .get("userPromptService")
      .listDeleted(ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  create: publicProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation(({ ctx, input }) =>
      ctx.diContainer
        .get("userPromptService")
        .create(ctx.userId, input)
        .then((x) => UserPromptData.parse(x))
    ),
  update: publicProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation(({ ctx, input }) =>
      ctx.diContainer
        .get("userPromptService")
        .update(ctx.userId, input)
        .then((x) => UserPromptData.parse(x))
    ),
  delete: publicProcedure
    .input(UserPromptDelete)
    .mutation(({ ctx, input }) =>
      ctx.diContainer.get("userPromptService").delete(ctx.userId, input)
    ),
  restore: publicProcedure
    .input(UserPromptRestore)
    .mutation(({ ctx, input }) =>
      ctx.diContainer.get("userPromptService").restore(ctx.userId, input)
    ),
});
