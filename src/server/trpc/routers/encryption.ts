import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const encryptionRouter = t.router({
  decrypt: publicProcedure
    .input(
      z.object({
        payloadEncoded: z.string(),
      })
    )
    .output(z.string())
    .query(({ ctx, input }) => {
      if (process.env.NODE_ENV === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      return ctx.diContainer
        .get("encryptionService")
        .decrypt(input.payloadEncoded);
    }),
  encrypt: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .output(z.string())
    .query(({ ctx, input }) => {
      if (process.env.NODE_ENV === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      return ctx.diContainer.get("encryptionService").encrypt(input.text);
    }),
});
