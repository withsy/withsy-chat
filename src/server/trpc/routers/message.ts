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

export const messageRouter = t.router({
  get: publicProcedure
    .input(MessageGet)
    .output(MessageGetOutput)
    .query((opts) =>
      opts.ctx.container.get("messageService").get(opts.ctx.userId, opts.input)
    ),
  list: publicProcedure
    .input(MessageList)
    .output(MessageListOutput)
    .query((opts) =>
      opts.ctx.container.get("messageService").list(opts.ctx.userId, opts.input)
    ),
  update: publicProcedure
    .input(MessageUpdate)
    .output(MessageData)
    .mutation((opts) =>
      opts.ctx.container
        .get("messageService")
        .update(opts.ctx.userId, opts.input)
    ),
  send: publicProcedure
    .input(MessageSend)
    .output(MessageSendOutput)
    .mutation((opts) =>
      opts.ctx.container.get("messageService").send(opts.ctx.userId, opts.input)
    ),
});
