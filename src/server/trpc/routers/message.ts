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
    .query(({ ctx, input }) =>
      ctx.diContainer.get("messageService").get(ctx.userId, input)
    ),
  list: publicProcedure
    .input(MessageList)
    .output(MessageListOutput)
    .query(({ ctx, input }) =>
      ctx.diContainer.get("messageService").list(ctx.userId, input)
    ),
  update: publicProcedure
    .input(MessageUpdate)
    .output(MessageData)
    .mutation(({ ctx, input }) =>
      ctx.diContainer.get("messageService").update(ctx.userId, input)
    ),
  send: publicProcedure
    .input(MessageSend)
    .output(MessageSendOutput)
    .mutation(({ ctx, input }) =>
      ctx.diContainer.get("messageSender").send(ctx.userId, input)
    ),
});
