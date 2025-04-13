import {
  ListChatMessages,
  ReceiveChatChunkStream,
  SendChatMessage,
  StartChat,
  UpdateChat,
  UpdateChatMessage,
} from "@/types/chat";
import { UserPreferences } from "@/types/user";
import { procedure, router } from "../global";

export const appRouter = router({
  user: router({
    me: procedure.query((opts) => opts.ctx.s.user.me(opts.ctx.userId)),
    updatePrefs: procedure
      .input(UserPreferences)
      .mutation((opts) =>
        opts.ctx.s.user.updatePrefs(opts.ctx.userId, opts.input)
      ),
  }),
  chat: router({
    // TODO: pagination
    list: procedure.query((opts) => opts.ctx.s.chat.list(opts.ctx.userId)),
    update: procedure
      .input(UpdateChat)
      .mutation((opts) => opts.ctx.s.chat.update(opts.input)),
    start: procedure
      .input(StartChat)
      .mutation((opts) => opts.ctx.s.chat.start(opts.ctx.userId, opts.input)),
  }),
  chatMessage: {
    // TODO: pagination
    list: procedure
      .input(ListChatMessages)
      .query((opts) => opts.ctx.s.chatMessage.list(opts.input)),
    update: procedure
      .input(UpdateChatMessage)
      .query((opts) => opts.ctx.s.chatMessage.update(opts.input)),
    send: procedure
      .input(SendChatMessage)
      .mutation((opts) => opts.ctx.s.chatMessage.send(opts.input)),
  },
  chatChunk: {
    receiveStream: procedure
      .input(ReceiveChatChunkStream)
      .subscription(async function* (opts) {
        yield* opts.ctx.s.chatChunk.receiveStream(opts.input);
      }),
  },
});

export type AppRouter = typeof appRouter;
