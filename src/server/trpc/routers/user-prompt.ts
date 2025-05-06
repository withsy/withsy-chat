import * as UserPrompt from "@/types/user-prompt";
import { publicProcedure, t } from "../server";

export const userPromptRouter = t.router({
  get: publicProcedure
    .input(UserPrompt.Get)
    .output(UserPrompt.Data)
    .query((opts) =>
      opts.ctx.service.userPrompt
        .get(opts.ctx.userId, opts.input)
        .then((x) => UserPrompt.Data.parse(x))
    ),
  list: publicProcedure
    .output(UserPrompt.ListOutput)
    .query((opts) =>
      opts.ctx.service.userPrompt
        .list(opts.ctx.userId)
        .then((xs) => xs.map((x) => UserPrompt.Data.parse(x)))
    ),
  listDeleted: publicProcedure
    .output(UserPrompt.ListOutput)
    .query((opts) =>
      opts.ctx.service.userPrompt
        .listDeleted(opts.ctx.userId)
        .then((xs) => xs.map((x) => UserPrompt.Data.parse(x)))
    ),
  create: publicProcedure
    .input(UserPrompt.Create)
    .output(UserPrompt.Data)
    .mutation((opts) =>
      opts.ctx.service.userPrompt
        .create(opts.ctx.userId, opts.input)
        .then((x) => UserPrompt.Data.parse(x))
    ),
  update: publicProcedure
    .input(UserPrompt.Update)
    .output(UserPrompt.Data)
    .mutation((opts) =>
      opts.ctx.service.userPrompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPrompt.Data.parse(x))
    ),
  delete: publicProcedure
    .input(UserPrompt.Delete)
    .mutation((opts) =>
      opts.ctx.service.userPrompt.delete(opts.ctx.userId, opts.input)
    ),
  restore: publicProcedure
    .input(UserPrompt.Restore)
    .mutation((opts) =>
      opts.ctx.service.userPrompt.restore(opts.ctx.userId, opts.input)
    ),
});
