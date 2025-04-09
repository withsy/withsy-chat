import { db } from "../db";
import { UpdateChat } from "../db/chats";
import { UpdateUserPrefs } from "../db/users";
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
  }),
});

export type AppRouter = typeof appRouter;
