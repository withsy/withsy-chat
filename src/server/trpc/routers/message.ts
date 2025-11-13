import {
  MessageData,
  MessageGet,
  MessageGetOutput,
  MessageList,
  MessageListOutput,
  MessageSend,
  MessageSendOutput,
  MessageUpdate,
} from "@/types/message";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const messageRouter = t.router({
  get: publicProcedure
    .input(MessageGet)
    .output(MessageGetOutput)
    .query((opts) => inject("message").get(opts.ctx.userId, opts.input)),
  list: publicProcedure
    .input(MessageList)
    .output(MessageListOutput)
    .query((opts) => inject("message").list(opts.ctx.userId, opts.input)),
  update: publicProcedure
    .input(MessageUpdate)
    .output(MessageData)
    .mutation((opts) => inject("message").update(opts.ctx.userId, opts.input)),
  send: publicProcedure
    .input(MessageSend)
    .output(MessageSendOutput)
    .mutation((opts) => inject("message").send(opts.ctx.userId, opts.input)),
});
