import {
  UserUsageLimitList,
  UserUsageLimitListOutput,
} from "@/types/user-usage-limit";
import { t, userProcedure } from "../trpc/server";
import { UserUsageLimitServiceFactory } from "./user-usage-limit.service-factory";

export const userUsageLimitRouter = t.router({
  list: userProcedure
    .input(UserUsageLimitList)
    .output(UserUsageLimitListOutput)
    .query(({ ctx, input }) =>
      new UserUsageLimitServiceFactory(ctx.serverContext)
        .create()
        .list(ctx.userId, input)
    ),
});
