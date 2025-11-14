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
      opts.ctx.container
        .get("userPromptService")
        .get(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  list: publicProcedure.output(UserPromptListOutput).query((opts) =>
    opts.ctx.container
      .get("userPromptService")
      .list(opts.ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  listDeleted: publicProcedure.output(UserPromptListOutput).query((opts) =>
    opts.ctx.container
      .get("userPromptService")
      .listDeleted(opts.ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  create: publicProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation((opts) =>
      opts.ctx.container
        .get("userPromptService")
        .create(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  update: publicProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation((opts) =>
      opts.ctx.container
        .get("userPromptService")
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  delete: publicProcedure
    .input(UserPromptDelete)
    .mutation((opts) =>
      opts.ctx.container
        .get("userPromptService")
        .delete(opts.ctx.userId, opts.input)
    ),
  restore: publicProcedure
    .input(UserPromptRestore)
    .mutation((opts) =>
      opts.ctx.container
        .get("userPromptService")
        .restore(opts.ctx.userId, opts.input)
    ),
});
