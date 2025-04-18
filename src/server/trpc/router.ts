import {
  Chat,
  ChatChunk,
  ChatMessage,
  ListChatMessages,
  ReceiveChatChunkStream,
  SendChatMessage,
  SendChatMessageResult,
  StartChat,
  StartChatResult,
  UpdateChat,
  UpdateChatMessage,
} from "@/types/chat";
import { UpdateUserPrefs, UserPrefs } from "@/types/user";
import { zAsyncIterable } from "../z-async-iterable";
import { publicProcedure, t } from "./server";

export const trpcRouter = t.router({
  user: t.router({
    prefs: publicProcedure
      .output(UserPrefs)
      .query(async (opts) =>
        opts.ctx.service.user
          .prefs(opts.ctx.userId)
          .then((x) => UserPrefs.parse(x))
      ),
    updatePrefs: publicProcedure
      .input(UpdateUserPrefs)
      .output(UserPrefs)
      .mutation(async (opts) =>
        opts.ctx.service.user
          .updatePrefs(opts.ctx.userId, opts.input)
          .then((x) => UserPrefs.parse(x))
      ),
  }),
  chat: t.router({
    list: publicProcedure
      .output(Chat.array())
      .query(async (opts) =>
        opts.ctx.service.chat
          .list(opts.ctx.userId)
          .then((xs) => xs.map((x) => Chat.parse(x)))
      ),
    update: publicProcedure
      .input(UpdateChat)
      .output(Chat)
      .mutation(async (opts) =>
        opts.ctx.service.chat
          .update(opts.ctx.userId, opts.input)
          .then((x) => Chat.parse(x))
      ),
    start: publicProcedure
      .input(StartChat)
      .output(StartChatResult)
      .mutation(async (opts) =>
        opts.ctx.service.chat
          .start(opts.ctx.userId, opts.input)
          .then((x) => StartChatResult.parse(x))
      ),
  }),
  chatMessage: t.router({
    list: publicProcedure
      .input(ListChatMessages)
      .output(ChatMessage.array())
      .query(async (opts) =>
        opts.ctx.service.chatMessage
          .list(opts.ctx.userId, opts.input)
          .then((xs) => xs.map((x) => ChatMessage.parse(x)))
      ),
    update: publicProcedure
      .input(UpdateChatMessage)
      .output(ChatMessage)
      .mutation(async (opts) =>
        opts.ctx.service.chatMessage
          .update(opts.ctx.userId, opts.input)
          .then((x) => ChatMessage.parse(x))
      ),
    send: publicProcedure
      .input(SendChatMessage)
      .output(SendChatMessageResult)
      .mutation(async (opts) =>
        opts.ctx.service.chatMessage
          .send(opts.ctx.userId, opts.input)
          .then((x) => SendChatMessageResult.parse(x))
      ),
  }),
  chatChunk: t.router({
    receiveStream: publicProcedure
      .input(ReceiveChatChunkStream)
      .output(
        zAsyncIterable({
          yield: ChatChunk,
          tracked: true,
        })
      )
      .subscription(async function* (opts) {
        yield* opts.ctx.service.chatChunk.receiveStream(
          opts.ctx.userId,
          opts.input
        );
      }),
  }),
});

export type TrpcRouter = typeof trpcRouter;
