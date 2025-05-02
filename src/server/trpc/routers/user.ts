import { User } from "@/types";
import { publicProcedure, t } from "../server";

export const userRouter = t.router({
  get: publicProcedure
    .output(User.Data)
    .query((opts) => opts.ctx.service.user.get(opts.ctx.userId)),
  ensure: publicProcedure
    .input(User.Ensure)
    .output(User.Data)
    .mutation((opts) =>
      opts.ctx.service.user.ensure(opts.ctx.userId, opts.input)
    ),
  updatePrefs: publicProcedure
    .input(User.UpdatePrefs)
    .output(User.UpdatePrefsOutput)
    .mutation((opts) =>
      opts.ctx.service.user.updatePrefs(opts.ctx.userId, opts.input)
    ),
  update: publicProcedure
    .input(User.Update)
    .output(User.Data)
    .mutation((opts) =>
      opts.ctx.service.user.update(opts.ctx.userId, opts.input)
    ),
});
