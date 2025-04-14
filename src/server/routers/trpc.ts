import {
  ListChatMessages,
  ReceiveChatChunkStream,
  SendChatMessage,
  StartChat,
  UpdateChat,
  UpdateChatMessage,
} from "@/types/chat";
import { UpdateUserPrefs } from "@/types/user";
import { tProcedure, tRouter } from "../global";

export const trpcRouter = tRouter({
  user: tRouter({
    me: tProcedure.query(async (opts) =>
      (await opts.ctx.s.get("user")).me(opts.ctx.userId)
    ),
    updatePrefs: tProcedure
      .input(UpdateUserPrefs)
      .mutation(async (opts) =>
        (await opts.ctx.s.get("user")).updatePrefs(opts.ctx.userId, opts.input)
      ),
  }),
  chat: tRouter({
    list: tProcedure.query(async (opts) =>
      (await opts.ctx.s.get("chat")).list(opts.ctx.userId)
    ),
    update: tProcedure
      .input(UpdateChat)
      .mutation(async (opts) =>
        (await opts.ctx.s.get("chat")).update(opts.input)
      ),
    start: tProcedure
      .input(StartChat)
      .mutation(async (opts) =>
        (await opts.ctx.s.get("chat")).start(opts.ctx.userId, opts.input)
      ),
  }),
  chatMessage: tRouter({
    list: tProcedure
      .input(ListChatMessages)
      .query(async (opts) =>
        (await opts.ctx.s.get("chatMessage")).list(opts.input)
      ),
    update: tProcedure
      .input(UpdateChatMessage)
      .query(async (opts) =>
        (await opts.ctx.s.get("chatMessage")).update(opts.input)
      ),
    send: tProcedure
      .input(SendChatMessage)
      .mutation(async (opts) =>
        (await opts.ctx.s.get("chatMessage")).send(opts.input)
      ),
  }),
  chatChunk: tRouter({
    receiveStream: tProcedure
      .input(ReceiveChatChunkStream)
      .subscription(async function* (opts) {
        yield* (await opts.ctx.s.get("chatChunk")).receiveStream(opts.input);
      }),
  }),
});

export type TrpcRouter = typeof trpcRouter;
