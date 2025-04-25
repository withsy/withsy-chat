import { User, UserEnsure } from "@/types/user";
import { publicProcedure, t } from "../server";

export const userRouter = t.router({
  ensure: publicProcedure
    .input(UserEnsure)
    .output(User)
    .mutation(async (opts) =>
      opts.ctx.service.user
        .ensure(opts.ctx.userId, opts.input)
        .then((x) => User.parse(x))
    ),
});
