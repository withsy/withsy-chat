import { UserUsageLimit } from "@/types";
import { publicProcedure, t } from "../server";

export const userUsageLimitRouter = t.router({
  list: publicProcedure
    .input(UserUsageLimit.List)
    .output(UserUsageLimit.ListOutput)
    .query((opts) =>
      opts.ctx.service.userUsageLimit.list(opts.ctx.userId, opts.input)
    ),
});
