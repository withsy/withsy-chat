import {
  ListChatMessages,
  ReceiveChatChunkStream,
  SendChatMessage,
  StartChat,
  UpdateChat,
  UpdateChatMessage,
} from "@/types/chat";
import { UpdateUserPrefs } from "@/types/user";
import { publicProcedure, t } from "./server";

export const trpcRouter = t.router({
  user: t.router({
    prefs: publicProcedure.query(async (opts) =>
      opts.ctx.service.user.prefs(opts.ctx.userId)
    ),
    updatePrefs: publicProcedure
      .input(UpdateUserPrefs)
      .mutation(async (opts) =>
        opts.ctx.service.user.updatePrefs(opts.ctx.userId, opts.input)
      ),
  }),
  chat: t.router({
    list: publicProcedure.query(async (opts) =>
      opts.ctx.service.chat.list(opts.ctx.userId)
    ),
    update: publicProcedure
      .input(UpdateChat)
      .mutation(async (opts) =>
        opts.ctx.service.chat.update(opts.ctx.userId, opts.input)
      ),
    start: publicProcedure
      .input(StartChat)
      .mutation(async (opts) =>
        opts.ctx.service.chat.start(opts.ctx.userId, opts.input)
      ),
  }),
  chatMessage: t.router({
    list: publicProcedure
      .input(ListChatMessages)
      .query(async (opts) =>
        opts.ctx.service.chatMessage.list(opts.ctx.userId, opts.input)
      ),
    update: publicProcedure
      .input(UpdateChatMessage)
      .mutation(async (opts) =>
        opts.ctx.service.chatMessage.update(opts.ctx.userId, opts.input)
      ),
    send: publicProcedure
      .input(SendChatMessage)
      .mutation(async (opts) =>
        opts.ctx.service.chatMessage.send(opts.ctx.userId, opts.input)
      ),
  }),
  chatChunk: t.router({
    receiveStream: publicProcedure
      .input(ReceiveChatChunkStream)
      .subscription(async function* (opts) {
        yield* opts.ctx.service.chatChunk.receiveStream(
          opts.ctx.userId,
          opts.input
        );
      }),
  }),
});

export type TrpcRouter = typeof trpcRouter;
