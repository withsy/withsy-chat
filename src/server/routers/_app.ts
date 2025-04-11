import {
  ListChatMessages,
  ReceiveChatMessageStream,
  SendChatMessage,
  StartChat,
  UpdateChat,
} from "@/types/chat";
import { UpdateUserPrefs } from "@/types/user";
import { db, procedure, router } from "../global";

export const appRouter = router({
  user: router({
    me: procedure.query((opts) => db.users.me(opts.ctx.userId)),
    updatePrefs: procedure
      .input(UpdateUserPrefs)
      .mutation((opts) =>
        db.users.updateUserPrefs(opts.ctx.userId, opts.input)
      ),
  }),
  chat: router({
    // TODO: pagination
    list: procedure.query((opts) => db.chats.listChats(opts.ctx.userId)),
    update: procedure
      .input(UpdateChat)
      .mutation((opts) => db.chats.updateChat(opts.input)),
    start: procedure
      .input(StartChat)
      .mutation((opts) => db.chats.startChat(opts.ctx.userId, opts.input)),
    // TODO: pagination
    listMessages: procedure
      .input(ListChatMessages)
      .query((opts) => db.chats.listChatMessages(opts.input)),
    sendMessage: procedure
      .input(SendChatMessage)
      .mutation((opts) => db.chats.sendChatMessage(opts.input)),
    receiveMessageStream: procedure
      .input(ReceiveChatMessageStream)
      .subscription(async function* (opts) {
        yield* db.chats.receiveChatMessageStream(opts.input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
