import { devProcedure, t } from "../trpc/server";
import { ApiKeyUtils } from "./api-key.utils";

export const apiKeyRouter = t.router({
  create: devProcedure.mutation(({ ctx }) =>
    ApiKeyUtils.createService(ctx.serverContext).create()
  ),
});
