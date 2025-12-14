import { apiKeyProcedure, t } from "../trpc/server";
import { TickUtils } from "./tick.utils";

export const tickRouter = t.router({
  tickMinute: apiKeyProcedure.mutation(({ ctx }) =>
    TickUtils.createService(ctx.serverContext).tickMinute()
  ),
  tickDaily: apiKeyProcedure.mutation(({ ctx }) =>
    TickUtils.createService(ctx.serverContext).tickDaily()
  ),
  tickMonthly: apiKeyProcedure.mutation(({ ctx }) =>
    TickUtils.createService(ctx.serverContext).tickMonthly()
  ),
});
