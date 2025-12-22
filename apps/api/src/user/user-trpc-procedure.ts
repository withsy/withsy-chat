import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrpcService } from "../trpc/trpc-service";

@Injectable()
export class UserTrpcProcedure {
  readonly procedure;

  constructor(trpcService: TrpcService) {
    this.procedure = trpcService.publicProcedure.use(async ({ ctx, next }) => {
      const { req } = ctx;

      const userId = req.headers["x-user-id"];
      if (typeof userId !== "string" || !userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid X-User-Id.",
        });
      }

      const context = {
        ...ctx,
        userId,
      };

      return next({ ctx: context });
    });
  }
}
