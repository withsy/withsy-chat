import {
  User,
  UserEnsure,
  UserUpdate,
  UserUpdatePrefs,
  UserUpdatePrefsOutput,
} from "@/types/user";
import { publicProcedure, t } from "../server";

export const userRouter = t.router({
  get: publicProcedure
    .output(User)
    .query((opts) =>
      opts.ctx.service.user.get(opts.ctx.userId).then((x) => User.parse(x))
    ),
  ensure: publicProcedure
    .input(UserEnsure)
    .output(User)
    .mutation((opts) =>
      opts.ctx.service.user
        .ensure(opts.ctx.userId, opts.input)
        .then((x) => User.parse(x))
    ),
  updatePrefs: publicProcedure
    .input(UserUpdatePrefs)
    .output(UserUpdatePrefsOutput)
    .mutation((opts) =>
      opts.ctx.service.user
        .updatePrefs(opts.ctx.userId, opts.input)
        .then((x) => UserUpdatePrefsOutput.parse(x))
    ),
  update: publicProcedure
    .input(UserUpdate)
    .output(User)
    .mutation((opts) =>
      opts.ctx.service.user
        .update(opts.ctx.userId, opts.input)
        .then((x) => User.parse(x))
    ),
});
