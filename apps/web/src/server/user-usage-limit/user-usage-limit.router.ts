import {
  UserUsageLimitList,
  UserUsageLimitListOutput,
} from "@/types/user-usage-limit";
import { t, userProcedure } from "../trpc/server";

export const userUsageLimitRouter = t.router({
  list: userProcedure
    .input(UserUsageLimitList)
    .output(UserUsageLimitListOutput)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.userUsageLimitService.list(ctx.userId, input)
    ),
});
