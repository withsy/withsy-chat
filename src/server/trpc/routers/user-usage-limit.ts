import {
  UserUsageLimitList,
  UserUsageLimitListOutput,
} from "@/types/user-usage-limit";
import { publicProcedure, t } from "../server";

export const userUsageLimitRouter = t.router({
  list: publicProcedure
    .input(UserUsageLimitList)
    .output(UserUsageLimitListOutput)
    .query((opts) =>
      opts.ctx.service.userUsageLimit.list(opts.ctx.userId, opts.input)
    ),
});
