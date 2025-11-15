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

export const chatRouter = t.router({
  list: publicProcedure
    .output(ChatListOutout)
    .query(({ ctx }) =>
      ctx.serviceRegistry.chatService
        .list(ctx.userId)
        .then((xs) => xs.map((x) => ChatData.parse(x)))
    ),
  listDeleted: publicProcedure
    .output(ChatListOutout)
    .query(({ ctx }) =>
      ctx.serviceRegistry.chatService
        .listDeleted(ctx.userId)
        .then((xs) => xs.map((x) => ChatData.parse(x)))
    ),
  get: publicProcedure
    .input(ChatGet)
    .output(ChatData)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.chatService
        .get(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
  update: publicProcedure
    .input(ChatUpdate)
    .output(ChatData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatService
        .update(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
  delete: publicProcedure
    .input(ChatDelete)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatService.delete(ctx.userId, input)
    ),
  restore: publicProcedure
    .input(ChatRestore)
    .output(ChatData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatService
        .restore(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
  start: publicProcedure
    .input(ChatStart)
    .output(ChatStartOutput)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatStarter
        .start(ctx.userId, input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
