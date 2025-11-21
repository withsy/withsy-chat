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
import { t, userProcedure } from "../trpc/server";

export const chatRouter = t.router({
  list: userProcedure
    .output(ChatListOutout)
    .query(({ ctx }) =>
      ctx.serviceRegistry.chatService
        .list(ctx.userId)
        .then((xs) => xs.map((x) => ChatData.parse(x)))
    ),
  listDeleted: userProcedure
    .output(ChatListOutout)
    .query(({ ctx }) =>
      ctx.serviceRegistry.chatService
        .listDeleted(ctx.userId)
        .then((xs) => xs.map((x) => ChatData.parse(x)))
    ),
  get: userProcedure
    .input(ChatGet)
    .output(ChatData)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.chatService
        .get(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
  update: userProcedure
    .input(ChatUpdate)
    .output(ChatData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatService
        .update(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
  delete: userProcedure
    .input(ChatDelete)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatService.delete(ctx.userId, input)
    ),
  restore: userProcedure
    .input(ChatRestore)
    .output(ChatData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatService
        .restore(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
  start: userProcedure
    .input(ChatStart)
    .output(ChatStartOutput)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatStarter
        .start(ctx.userId, input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
