import {
  UserData,
  UserEnsure,
  UserUpdate,
  UserUpdatePrefs,
  UserUpdatePrefsOutput,
} from "@/types/user";
import { t, userProcedure } from "../trpc/server";

export const userRouter = t.router({
  get: userProcedure
    .output(UserData)
    .query((opts) => opts.ctx.serviceRegistry.userService.get(opts.ctx.userId)),
  ensure: userProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation((opts) =>
      opts.ctx.serviceRegistry.userService.ensure(opts.ctx.userId, opts.input)
    ),
  updatePrefs: userProcedure
    .input(UserUpdatePrefs)
    .output(UserUpdatePrefsOutput)
    .mutation((opts) =>
      opts.ctx.serviceRegistry.userService.updatePrefs(
        opts.ctx.userId,
        opts.input
      )
    ),
  update: userProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation((opts) =>
      opts.ctx.serviceRegistry.userService.update(opts.ctx.userId, opts.input)
    ),
});
