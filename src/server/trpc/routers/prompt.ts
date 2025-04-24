import {
  Prompt,
  PromptCreate,
  PromptGet,
  PromptList,
  PromptMeta,
  PromptStart,
  PromptStartOutput,
  PromptUpdate,
} from "@/types/prompt";
import { publicProcedure, t } from "../server";

export const promptRouter = t.router({
  get: publicProcedure
    .input(PromptGet)
    .output(Prompt)
    .query(async (opts) =>
      opts.ctx.service.prompt
        .get(opts.ctx.userId, opts.input)
        .then((x) => Prompt.parse(x))
    ),
  list: publicProcedure
    .input(PromptList)
    .output(PromptMeta.array())
    .query(async (opts) =>
      opts.ctx.service.prompt
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => PromptMeta.parse(x)))
    ),
  create: publicProcedure
    .input(PromptCreate)
    .output(Prompt)
    .mutation(async (opts) =>
      opts.ctx.service.prompt
        .create(opts.ctx.userId, opts.input)
        .then((x) => Prompt.parse(x))
    ),
  update: publicProcedure
    .input(PromptUpdate)
    .output(Prompt)
    .mutation(async (opts) =>
      opts.ctx.service.prompt
        .update(opts.ctx.userId, opts.input)
        .then((x) => Prompt.parse(x))
    ),
  start: publicProcedure
    .input(PromptStart)
    .output(PromptStartOutput)
    .mutation(async (opts) =>
      opts.ctx.service.prompt
        .start(opts.ctx.userId, opts.input)
        .then((x) => PromptStartOutput.parse(x))
    ),
});
