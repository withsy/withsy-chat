import {
  ListChatMessages,
  ReceiveChatChunkStream,
  SendChatMessage,
  StartChat,
  UpdateChat,
  UpdateChatMessage,
} from "@/types/chat";
import { UpdateUserPrefs } from "@/types/user";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import * as trpcNext from "@trpc/server/adapters/next";
import { createApiContext } from "../api-context";
import { publicProcedure, t } from "../trpc";

export const trpcRouter = t.router({
  user: t.router({
    me: publicProcedure.query(async (opts) =>
      opts.ctx.s.user.me(opts.ctx.userId)
    ),
    updatePrefs: publicProcedure
      .input(UpdateUserPrefs)
      .mutation(async (opts) =>
        opts.ctx.s.user.updatePrefs(opts.ctx.userId, opts.input)
      ),
  }),
  chat: t.router({
    list: publicProcedure.query(async (opts) =>
      opts.ctx.s.chat.list(opts.ctx.userId)
    ),
    update: publicProcedure
      .input(UpdateChat)
      .mutation(async (opts) => opts.ctx.s.chat.update(opts.input)),
    start: publicProcedure
      .input(StartChat)
      .mutation(async (opts) =>
        opts.ctx.s.chat.start(opts.ctx.userId, opts.input)
      ),
  }),
  chatMessage: t.router({
    list: publicProcedure
      .input(ListChatMessages)
      .query(async (opts) => opts.ctx.s.chatMessage.list(opts.input)),
    update: publicProcedure
      .input(UpdateChatMessage)
      .query(async (opts) => opts.ctx.s.chatMessage.update(opts.input)),
    send: publicProcedure
      .input(SendChatMessage)
      .mutation(async (opts) => opts.ctx.s.chatMessage.send(opts.input)),
  }),
  chatChunk: t.router({
    receiveStream: publicProcedure
      .input(ReceiveChatChunkStream)
      .subscription(async function* (opts) {
        yield* opts.ctx.s.chatChunk.receiveStream(opts.input);
      }),
  }),
});

export type TrpcRouter = typeof trpcRouter;

export const trpcHandler = trpcNext.createNextApiHandler({
  router: trpcRouter,
  createContext: async ({}: CreateNextContextOptions) => {
    return await createApiContext();
  },
  onError: (opts) => {
    console.log("Trpc error occurred.", {
      type: opts.type,
      path: opts.path,
      error: opts.error,
    });
  },
});
