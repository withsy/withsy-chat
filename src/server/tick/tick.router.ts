import { apiKeyProcedure, t } from "../trpc/server";

export const tickRouter = t.router({
  callEvery5minutes: apiKeyProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.tickService.callEvery5minutes()
  ),
  callDaily: apiKeyProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.tickService.callDaily()
  ),
});
