import { devProcedure, t } from "../trpc/server";

export const apiKeyRouter = t.router({
  createApiKey: devProcedure.mutation(({ ctx }) =>
    ctx.serviceRegistry.apiKeyService.createApiKey()
  ),
});
