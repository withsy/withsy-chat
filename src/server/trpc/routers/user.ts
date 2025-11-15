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
    .query((opts) => opts.ctx.serviceRegistry.userService.get(opts.ctx.userId)),
  ensure: publicProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation((opts) =>
      opts.ctx.serviceRegistry.userService.ensure(opts.ctx.userId, opts.input)
    ),
  updatePrefs: publicProcedure
    .input(UserUpdatePrefs)
    .output(UserUpdatePrefsOutput)
    .mutation((opts) =>
      opts.ctx.serviceRegistry.userService.updatePrefs(
        opts.ctx.userId,
        opts.input
      )
    ),
  update: publicProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation((opts) =>
      opts.ctx.serviceRegistry.userService.update(opts.ctx.userId, opts.input)
    ),
});
