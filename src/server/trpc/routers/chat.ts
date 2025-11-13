import {
  ChatData,
  ChatDelete,
  ChatGet,
  ChatListOutout,
  ChatRestore,
  ChatStart,
  ChatStartOutput,
  ChatUpdate,
} from "@/types/chat";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const chatRouter = t.router({
  list: publicProcedure.output(ChatListOutout).query((opts) =>
    inject("chat")
      .list(opts.ctx.userId)
      .then((xs) => xs.map((x) => ChatData.parse(x)))
  ),
  listDeleted: publicProcedure.output(ChatListOutout).query((opts) =>
    inject("chat")
      .listDeleted(opts.ctx.userId)
      .then((xs) => xs.map((x) => ChatData.parse(x)))
  ),
  get: publicProcedure
    .input(ChatGet)
    .output(ChatData)
    .query((opts) =>
      inject("chat")
        .get(opts.ctx.userId, opts.input)
        .then((x) => ChatData.parse(x))
    ),
  update: publicProcedure
    .input(ChatUpdate)
    .output(ChatData)
    .mutation((opts) =>
      inject("chat")
        .update(opts.ctx.userId, opts.input)
        .then((x) => ChatData.parse(x))
    ),
  delete: publicProcedure
    .input(ChatDelete)
    .mutation((opts) => inject("chat").delete(opts.ctx.userId, opts.input)),
  restore: publicProcedure
    .input(ChatRestore)
    .output(ChatData)
    .mutation((opts) =>
      inject("chat")
        .restore(opts.ctx.userId, opts.input)
        .then((x) => ChatData.parse(x))
    ),
  start: publicProcedure
    .input(ChatStart)
    .output(ChatStartOutput)
    .mutation((opts) =>
      inject("chat")
        .start(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
