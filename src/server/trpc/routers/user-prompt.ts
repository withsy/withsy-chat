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
    .query((opts) =>
      opts.ctx.service.userPrompt
        .get(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  list: publicProcedure
    .output(UserPromptListOutput)
    .query((opts) =>
      opts.ctx.service.userPrompt
        .list(opts.ctx.userId)
        .then((xs) => xs.map((x) => UserPromptData.parse(x)))
    ),
  listDeleted: publicProcedure
    .output(UserPromptListOutput)
    .query((opts) =>
      opts.ctx.service.userPrompt
        .listDeleted(opts.ctx.userId)
        .then((xs) => xs.map((x) => UserPromptData.parse(x)))
    ),
  create: publicProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation((opts) =>
      opts.ctx.service.userPrompt
        .create(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  update: publicProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation((opts) =>
      opts.ctx.service.userPrompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  delete: publicProcedure
    .input(UserPromptDelete)
    .mutation((opts) =>
      opts.ctx.service.userPrompt.delete(opts.ctx.userId, opts.input)
    ),
  restore: publicProcedure
    .input(UserPromptRestore)
    .mutation((opts) =>
      opts.ctx.service.userPrompt.restore(opts.ctx.userId, opts.input)
    ),
});
