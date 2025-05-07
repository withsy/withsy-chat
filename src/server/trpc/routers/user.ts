import {
  UserData,
  UserEnsure,
  UserUpdate,
  UserUpdatePrefs,
  UserUpdatePrefsOutput,
} from "@/types/user";
import { publicProcedure, t } from "../server";

export const userRouter = t.router({
  get: publicProcedure
    .output(UserData)
    .query((opts) => opts.ctx.service.user.get(opts.ctx.userId)),
  ensure: publicProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation((opts) =>
      opts.ctx.service.user.ensure(opts.ctx.userId, opts.input)
    ),
  updatePrefs: publicProcedure
    .input(UserUpdatePrefs)
    .output(UserUpdatePrefsOutput)
    .mutation((opts) =>
      opts.ctx.service.user.updatePrefs(opts.ctx.userId, opts.input)
    ),
  update: publicProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation((opts) =>
      opts.ctx.service.user.update(opts.ctx.userId, opts.input)
    ),
});
