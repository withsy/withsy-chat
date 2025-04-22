import { UpdateUserPrefs, UserPrefs } from "@/types/user";
import { publicProcedure, t } from "../server";

export const userPrefsRouter = t.router({
  get: publicProcedure
    .output(UserPrefs)
    .query(async (opts) =>
      opts.ctx.service.userPrefs
        .get(opts.ctx.userId)
        .then((x) => UserPrefs.parse(x))
    ),
  update: publicProcedure
    .input(UpdateUserPrefs)
    .output(UserPrefs)
    .mutation(async (opts) =>
      opts.ctx.service.userPrefs
        .update(opts.ctx.userId, opts.input)
        .then((x) => UserPrefs.parse(x))
    ),
});
