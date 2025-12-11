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
    .query(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserPromptServiceFactory(serverContext)
        .create()
        .get({ ...input, userId });
    }),
  list: userProcedure
    .input(UserPromptList)
    .output(UserPromptListOutput)
    .query(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserPromptServiceFactory(serverContext)
        .create()
        .list({ ...input, userId });
    }),
  create: userProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserPromptServiceFactory(serverContext)
        .create()
        .create({ ...input, userId });
    }),
  update: userProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserPromptServiceFactory(serverContext)
        .create()
        .update({ ...input, userId });
    }),
  delete: userProcedure.input(UserPromptDelete).mutation(({ ctx, input }) => {
    const { serverContext, userId } = ctx;
    return new UserPromptServiceFactory(serverContext)
      .create()
      .delete({ ...input, userId });
  }),
});
