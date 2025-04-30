import {
  Chat,
  ChatDelete,
  ChatGet,
  ChatRestore,
  ChatStart,
  ChatStartOutput,
  ChatUpdate,
} from "@/types/chat";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const chatRouter = t.router({
  list: publicProcedure
    .output(z.array(Chat))
    .query((opts) =>
      opts.ctx.service.chat
        .list(opts.ctx.userId)
        .then((xs) => xs.map((x) => Chat.parse(x)))
    ),
  listDeleted: publicProcedure
    .output(z.array(Chat))
    .query((opts) =>
      opts.ctx.service.chat
        .listDeleted(opts.ctx.userId)
        .then((xs) => xs.map((x) => Chat.parse(x)))
    ),
  get: publicProcedure
    .input(ChatGet)
    .output(Chat)
    .query((opts) =>
      opts.ctx.service.chat
        .get(opts.ctx.userId, opts.input)
        .then((x) => Chat.parse(x))
    ),
  update: publicProcedure
    .input(ChatUpdate)
    .output(Chat)
    .mutation((opts) =>
      opts.ctx.service.chat
        .update(opts.ctx.userId, opts.input)
        .then((x) => Chat.parse(x))
    ),
  delete: publicProcedure
    .input(ChatDelete)
    .output(Chat)
    .mutation((opts) =>
      opts.ctx.service.chat
        .delete(opts.ctx.userId, opts.input)
        .then((x) => Chat.parse(x))
    ),
  restore: publicProcedure
    .input(ChatRestore)
    .output(Chat)
    .mutation((opts) =>
      opts.ctx.service.chat
        .restore(opts.ctx.userId, opts.input)
        .then((x) => Chat.parse(x))
    ),
  start: publicProcedure
    .input(ChatStart)
    .output(ChatStartOutput)
    .mutation((opts) =>
      opts.ctx.service.chat
        .start(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
