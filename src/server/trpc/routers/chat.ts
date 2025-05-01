import { Chat } from "@/types";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const chatRouter = t.router({
  list: publicProcedure
    .output(z.array(Chat.Data))
    .query((opts) =>
      opts.ctx.service.chat
        .list(opts.ctx.userId)
        .then((xs) => xs.map((x) => Chat.Data.parse(x)))
    ),
  listDeleted: publicProcedure
    .output(z.array(Chat.Data))
    .query((opts) =>
      opts.ctx.service.chat
        .listDeleted(opts.ctx.userId)
        .then((xs) => xs.map((x) => Chat.Data.parse(x)))
    ),
  get: publicProcedure
    .input(Chat.Get)
    .output(Chat.Data)
    .query((opts) =>
      opts.ctx.service.chat
        .get(opts.ctx.userId, opts.input)
        .then((x) => Chat.Data.parse(x))
    ),
  update: publicProcedure
    .input(Chat.Update)
    .output(Chat.Data)
    .mutation((opts) =>
      opts.ctx.service.chat
        .update(opts.ctx.userId, opts.input)
        .then((x) => Chat.Data.parse(x))
    ),
  delete: publicProcedure
    .input(Chat.Delete)
    .output(Chat.Data)
    .mutation((opts) =>
      opts.ctx.service.chat
        .delete(opts.ctx.userId, opts.input)
        .then((x) => Chat.Data.parse(x))
    ),
  restore: publicProcedure
    .input(Chat.Restore)
    .output(Chat.Data)
    .mutation((opts) =>
      opts.ctx.service.chat
        .restore(opts.ctx.userId, opts.input)
        .then((x) => Chat.Data.parse(x))
    ),
  start: publicProcedure
    .input(Chat.Start)
    .output(Chat.StartOutput)
    .mutation((opts) =>
      opts.ctx.service.chat
        .start(opts.ctx.userId, opts.input)
        .then((x) => Chat.StartOutput.parse(x))
    ),
});
