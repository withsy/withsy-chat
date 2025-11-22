import { apiKeyProcedure, t } from "../trpc/server";

export const tickRouter = t.router({
  tickEvery5minutes: apiKeyProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.tickService.tickEvery5minutes()
  ),
  tickDaily: apiKeyProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.tickService.tickDaily()
  ),
});
