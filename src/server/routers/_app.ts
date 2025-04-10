import {
  ListChatMessages,
  ReceiveChatMessage,
  SendChatMessage,
  StartChat,
  UpdateChat,
} from "@/types/chat";
import { UpdateUserPrefs } from "@/types/user";
import { db } from "../db";
import { procedure, router } from "../trpc";

export const appRouter = router({
  user: router({
    me: procedure.query((opts) => db.user.me(opts.ctx.userId)),
    updatePrefs: procedure
      .input(UpdateUserPrefs)
      .mutation((opts) => db.user.updatePrefs(opts.ctx.userId, opts.input)),
  }),
  chat: router({
    // TODO: pagenation
    list: procedure.query((opts) => db.chat.listChats(opts.ctx.userId)),
    update: procedure
      .input(UpdateChat)
      .mutation((opts) => db.chat.updateChat(opts.ctx.userId, opts.input)),
    start: procedure
      .input(StartChat)
      .mutation((opts) => db.chat.startChat(opts.ctx.userId, opts.input)),
  }),
  chatMessage: router({
    // TODO: pagenation
    list: procedure
      .input(ListChatMessages)
      .query((opts) => db.chat.listMessages(opts.input)),
    send: procedure
      .input(SendChatMessage)
      .mutation((opts) => db.chat.sendMessage(opts.input)),
    receive: procedure
      .input(ReceiveChatMessage)
      .subscription(async function* (opts) {
        yield* db.chat.receiveChatMessage(opts.input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
