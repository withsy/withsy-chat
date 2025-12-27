import { Injectable } from "@nestjs/common";
import { AuthToken } from "@repo/common";
import { TRPCError } from "@trpc/server";
import { decode } from "next-auth/jwt";
import { ConfigService } from "../config/config-service.js";
import { TrpcService } from "../trpc/trpc-service.js";

@Injectable()
export class UserTrpcProcedure {
  readonly procedure;

  constructor(trpcService: TrpcService, configService: ConfigService) {
    this.procedure = trpcService.publicProcedure.use(async ({ ctx, next }) => {
      const { req } = ctx;

      const cookiePrefix =
        configService.nodeEnv === "production" ? "__Secure-" : "";
      const cookieName = `${cookiePrefix}next-auth.session-token`;
      const [_, token] =
        req.headers.cookie
          ?.split(";")
          .find((x) => x.trimStart().startsWith(cookieName))
          ?.trimEnd()
          .split("=") ?? [];

      if (!token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid credentials.",
        });
      }

      const authToken = await decode({
        token,
        secret: configService.authSecret,
      });
      if (!authToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token.",
        });
      }

      const result = AuthToken.safeParse(authToken);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payload.",
        });
      }

      const { userId } = result.data;

      const context = {
        ...ctx,
        userId,
      };

      return next({ ctx: context });
    });
  }
}
