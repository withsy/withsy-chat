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
import { userProcedure, t } from "../server";

export const messageRouter = t.router({
  get: userProcedure
    .input(MessageGet)
    .output(MessageGetOutput)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.messageService.get(ctx.userId, input)
    ),
  list: userProcedure
    .input(MessageList)
    .output(MessageListOutput)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.messageService.list(ctx.userId, input)
    ),
  update: userProcedure
    .input(MessageUpdate)
    .output(MessageData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.messageService.update(ctx.userId, input)
    ),
  send: userProcedure
    .input(MessageSend)
    .output(MessageSendOutput)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.messageSender.send(ctx.userId, input)
    ),
});
