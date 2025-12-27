import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrpcService } from "../trpc/trpc-service.js";
import { ApiKeyService } from "./api-key-service.js";

@Injectable()
export class ApiKeyTrpcProcedure {
  readonly procedure;

  constructor(trpcService: TrpcService, apiKeyService: ApiKeyService) {
    this.procedure = trpcService.publicProcedure.use(async ({ ctx, next }) => {
      const { req } = ctx;

      const apiKey = req.headers["x-api-key"];
      if (typeof apiKey !== "string" || !apiKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid X-Api-Key.",
        });
      }

      if (!(await apiKeyService.validate({ apiKey }))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key.",
        });
      }

      return next({ ctx });
    });
  }
}
