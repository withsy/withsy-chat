import {
  UserUsageLimitData,
  UserUsageLimitList,
} from "@/types/user-usage-limit";
import { t, userProcedure } from "../trpc/server";
import { UserUsageLimitUtils } from "./user-usage-limit.utils";

export const userUsageLimitRouter = t.router({
  list: userProcedure
    .input(UserUsageLimitList)
    .output(UserUsageLimitData.array())
    .query(({ ctx, input }) =>
      UserUsageLimitUtils.createService(ctx.serverContext).list(
        ctx.userId,
        input
      )
    ),
});
