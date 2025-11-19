import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { userProcedure, t } from "../server";

export const encryptionRouter = t.router({
  decrypt: userProcedure
    .input(
      z.object({
        payloadEncoded: z.string(),
      })
    )
    .output(z.string())
    .query(({ ctx, input }) => {
      if (process.env.NODE_ENV === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      return ctx.serviceRegistry.encryptionService.decrypt(
        input.payloadEncoded
      );
    }),
  encrypt: userProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .output(z.string())
    .query(({ ctx, input }) => {
      if (process.env.NODE_ENV === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      return ctx.serviceRegistry.encryptionService.encrypt(input.text);
    }),
});
