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
    .query((opts) => {
      if (process.env.NODE_ENV === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return opts.ctx.container
        .get("encryptionService")
        .decrypt(opts.input.payloadEncoded);
    }),
  encrypt: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .output(z.string())
    .query((opts) => {
      if (process.env.NODE_ENV === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return opts.ctx.container
        .get("encryptionService")
        .encrypt(opts.input.text);
    }),
});
