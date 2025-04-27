import { UserPrompt } from "@/types";
import { publicProcedure, t } from "../server";

export const userPromptRouter = t.router({
  get: publicProcedure
    .input(UserPrompt.Get)
    .output(UserPrompt.Data)
    .query(async (opts) =>
      opts.ctx.service.userPrompt
        .get(opts.ctx.userId, opts.input)
        .then((x) => UserPrompt.Data.parse(x))
    ),
  list: publicProcedure
    .output(UserPrompt.Data.array())
    .query(async (opts) =>
      opts.ctx.service.userPrompt
        .list(opts.ctx.userId)
        .then((xs) => xs.map((x) => UserPrompt.Data.parse(x)))
    ),
  create: publicProcedure
    .input(UserPrompt.Create)
    .output(UserPrompt.Data)
    .mutation(async (opts) =>
      opts.ctx.service.userPrompt
        .create(opts.ctx.userId, opts.input)
        .then((x) => UserPrompt.Data.parse(x))
    ),
  update: publicProcedure
    .input(UserPrompt.Update)
    .output(UserPrompt.Data)
    .mutation(async (opts) =>
      opts.ctx.service.userPrompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPrompt.Data.parse(x))
    ),
});
