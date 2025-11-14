import {
  UserUsageLimitList,
  UserUsageLimitListOutput,
} from "@/types/user-usage-limit";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const userUsageLimitRouter = t.router({
  list: publicProcedure
    .input(UserUsageLimitList)
    .output(UserUsageLimitListOutput)
    .query((opts) =>
      inject("userUsageLimitService").list(opts.ctx.userId, opts.input)
    ),
});
