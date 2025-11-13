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
import { inject } from "@/server/service-registry";

export const userPromptRouter = t.router({
  get: publicProcedure
    .input(UserPromptGet)
    .output(UserPromptData)
    .query((opts) =>
      inject("userPrompt")
        .get(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  list: publicProcedure.output(UserPromptListOutput).query((opts) =>
    inject("userPrompt")
      .list(opts.ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  listDeleted: publicProcedure.output(UserPromptListOutput).query((opts) =>
    inject("userPrompt")
      .listDeleted(opts.ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  create: publicProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation((opts) =>
      inject("userPrompt")
        .create(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  update: publicProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation((opts) =>
      inject("userPrompt")
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  delete: publicProcedure
    .input(UserPromptDelete)
    .mutation((opts) =>
      inject("userPrompt").delete(opts.ctx.userId, opts.input)
    ),
  restore: publicProcedure
    .input(UserPromptRestore)
    .mutation((opts) =>
      inject("userPrompt").restore(opts.ctx.userId, opts.input)
    ),
});
