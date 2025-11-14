import {
  UserUsageLimitList,
  UserUsageLimitListOutput,
} from "@/types/user-usage-limit";
import { publicProcedure, t } from "../server";

export const userUsageLimitRouter = t.router({
  list: publicProcedure
    .input(UserUsageLimitList)
    .output(UserUsageLimitListOutput)
    .query(({ ctx, input }) =>
      ctx.diContainer.get("userUsageLimitService").list(ctx.userId, input)
    ),
});
