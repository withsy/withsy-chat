import { z } from "zod";
import { db } from "../db";
import { procedure, router } from "../trpc";

export const appRouter = router({
  user: router({
    me: procedure.query((opts) => {
      return db.user.me(opts.ctx.userId);
    }),
    updatePrefs: procedure
      .input(
        z.object({
          wideView: z.boolean().optional(),
          largeText: z.boolean().optional(),
          enableTabs: z.boolean().optional(),
          showIndex: z.boolean().optional(),
          enterToSend: z.boolean().optional(),
        })
      )
      .mutation((opts) => {
        db.user.updatePrefs(opts.ctx.userId, opts.input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
