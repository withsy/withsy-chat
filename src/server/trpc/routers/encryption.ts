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
      if (opts.ctx.service.env.nodeEnv === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return opts.ctx.service.encryption.decrypt(opts.input.payloadEncoded);
    }),
});
