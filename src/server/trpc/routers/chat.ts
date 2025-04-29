import {
  Chat,
  ChatDelete,
  ChatGet,
  ChatStart,
  ChatStartOutput,
  ChatUpdate,
} from "@/types/chat";
import { publicProcedure, t } from "../server";

export const chatRouter = t.router({
  list: publicProcedure
    .output(Chat.array())
    .query((opts) =>
      opts.ctx.service.chat
        .list(opts.ctx.userId)
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
  start: publicProcedure
    .input(ChatStart)
    .output(ChatStartOutput)
    .mutation((opts) =>
      opts.ctx.service.chat
        .start(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
