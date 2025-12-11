import {
  UserPromptCreate,
  UserPromptData,
  UserPromptDelete,
  UserPromptGet,
  UserPromptList,
  UserPromptListOutput,
  UserPromptRestore,
  UserPromptUpdate,
} from "@/types/user-prompt";
import { t, userProcedure } from "../trpc/server";
import { UserPromptServiceFactory } from "./user-prompt.service-factory";

export const userPromptRouter = t.router({
  get: userProcedure
    .input(UserPromptGet)
    .output(UserPromptData)
    .query(({ ctx, input }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .get({ ...input, userId: ctx.userId })
    ),
  list: userProcedure
    .input(UserPromptList)
    .output(UserPromptListOutput)
    .query(({ ctx, input }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .list({ ...input, userId: ctx.userId })
    ),
  listDeleted: userProcedure
    .output(UserPromptListOutput)
    .query(({ ctx }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .listDeleted(ctx.userId)
    ),
  create: userProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation(({ ctx, input }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .create(ctx.userId, input)
    ),
  update: userProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation(({ ctx, input }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .update(ctx.userId, input)
    ),
  delete: userProcedure
    .input(UserPromptDelete)
    .mutation(({ ctx, input }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .delete(ctx.userId, input)
    ),
  restore: userProcedure
    .input(UserPromptRestore)
    .mutation(({ ctx, input }) =>
      new UserPromptServiceFactory(ctx.serverContext)
        .create()
        .restore(ctx.userId, input)
    ),
});
