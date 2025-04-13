import {
  ListChatMessages,
  ReceiveChatChunkStream,
  SendChatMessage,
  StartChat,
  UpdateChat,
} from "@/types/chat";
import { UpdateUserPrefs } from "@/types/user";
import { procedure, router } from "../global";

export const appRouter = router({
  user: router({
    me: procedure.query((opts) => opts.ctx.s.get("user").me(opts.ctx.userId)),
    updatePrefs: procedure
      .input(UpdateUserPrefs)
      .mutation((opts) =>
        opts.ctx.s.get("user").updatePrefs(opts.ctx.userId, opts.input)
      ),
  }),
  chat: router({
    // TODO: pagination
    list: procedure.query((opts) =>
      opts.ctx.s.get("chat").list(opts.ctx.userId)
    ),
    update: procedure
      .input(UpdateChat)
      .mutation((opts) => opts.ctx.s.get("chat").update(opts.input)),
    start: procedure
      .input(StartChat)
      .mutation((opts) =>
        opts.ctx.s.get("chat").start(opts.ctx.userId, opts.input)
      ),
  }),
  chatMessage: {
    // TODO: pagination
    list: procedure
      .input(ListChatMessages)
      .query((opts) => opts.ctx.s.get("chatMessage").list(opts.input)),
    send: procedure
      .input(SendChatMessage)
      .mutation((opts) => opts.ctx.s.get("chatMessage").send(opts.input)),
  },
  chatChunk: {
    receiveStream: procedure
      .input(ReceiveChatChunkStream)
      .subscription(async function* (opts) {
        yield* opts.ctx.s.get("chatChunk").receiveStream(opts.input);
      }),
  },
});

export type AppRouter = typeof appRouter;
