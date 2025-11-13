import {
  UserData,
  UserEnsure,
  UserUpdate,
  UserUpdatePrefs,
  UserUpdatePrefsOutput,
} from "@/types/user";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const userRouter = t.router({
  get: publicProcedure
    .output(UserData)
    .query((opts) => inject("user").get(opts.ctx.userId)),
  ensure: publicProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation((opts) => inject("user").ensure(opts.ctx.userId, opts.input)),
  updatePrefs: publicProcedure
    .input(UserUpdatePrefs)
    .output(UserUpdatePrefsOutput)
    .mutation((opts) =>
      inject("user").updatePrefs(opts.ctx.userId, opts.input)
    ),
  update: publicProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation((opts) => inject("user").update(opts.ctx.userId, opts.input)),
});
