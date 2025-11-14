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
      inject("userPromptService")
        .get(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  list: publicProcedure.output(UserPromptListOutput).query((opts) =>
    inject("userPromptService")
      .list(opts.ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  listDeleted: publicProcedure.output(UserPromptListOutput).query((opts) =>
    inject("userPromptService")
      .listDeleted(opts.ctx.userId)
      .then((xs) => xs.map((x) => UserPromptData.parse(x)))
  ),
  create: publicProcedure
    .input(UserPromptCreate)
    .output(UserPromptData)
    .mutation((opts) =>
      inject("userPromptService")
        .create(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  update: publicProcedure
    .input(UserPromptUpdate)
    .output(UserPromptData)
    .mutation((opts) =>
      inject("userPromptService")
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPromptData.parse(x))
    ),
  delete: publicProcedure
    .input(UserPromptDelete)
    .mutation((opts) =>
      inject("userPromptService").delete(opts.ctx.userId, opts.input)
    ),
  restore: publicProcedure
    .input(UserPromptRestore)
    .mutation((opts) =>
      inject("userPromptService").restore(opts.ctx.userId, opts.input)
    ),
});
