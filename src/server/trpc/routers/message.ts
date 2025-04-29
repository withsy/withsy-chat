import {
  Message,
  MessageList,
  MessageSend,
  MessageSendOutput,
  MessageUpdate,
} from "@/types/message";
import { publicProcedure, t } from "../server";

export const messageRouter = t.router({
  list: publicProcedure
    .input(MessageList)
    .output(Message.array())
    .query((opts) =>
      opts.ctx.service.message
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => Message.parse(x)))
    ),
  update: publicProcedure
    .input(MessageUpdate)
    .output(Message)
    .mutation((opts) =>
      opts.ctx.service.message
        .update(opts.ctx.userId, opts.input)
        .then((x) => Message.parse(x))
    ),
  send: publicProcedure
    .input(MessageSend)
    .output(MessageSendOutput)
    .mutation((opts) =>
      opts.ctx.service.message
        .send(opts.ctx.userId, opts.input)
        .then((x) => MessageSendOutput.parse(x))
    ),
});
