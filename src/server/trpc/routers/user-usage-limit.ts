import { UserUsageLimit } from "@/types/user-usage-limit";
import { publicProcedure, t } from "../server";

export const userUsageLimitRouter = t.router({
  get: publicProcedure
    .output(UserUsageLimit)
    .query(async (opts) =>
      opts.ctx.service.userUsageLimit
        .get(opts.ctx.userId)
        .then((x) => UserUsageLimit.parse(x))
    ),
});
