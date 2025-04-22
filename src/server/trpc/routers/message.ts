import { ChatMessage } from "@/types/chat";
import {
  MessageList,
  MessageSend,
  MessageSendOutput,
  MessageUpdate,
} from "@/types/message";
import { publicProcedure, t } from "../server";

export const messageRouter = t.router({
  list: publicProcedure
    .input(MessageList)
    .output(ChatMessage.array())
    .query(async (opts) =>
      opts.ctx.service.message
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => ChatMessage.parse(x)))
    ),
  update: publicProcedure
    .input(MessageUpdate)
    .output(ChatMessage)
    .mutation(async (opts) =>
      opts.ctx.service.message
        .update(opts.ctx.userId, opts.input)
        .then((x) => ChatMessage.parse(x))
    ),
  send: publicProcedure
    .input(MessageSend)
    .output(MessageSendOutput)
    .mutation(async (opts) =>
      opts.ctx.service.message
        .send(opts.ctx.userId, opts.input)
        .then((x) => MessageSendOutput.parse(x))
    ),
});
