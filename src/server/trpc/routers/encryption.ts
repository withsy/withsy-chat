import { envConfig } from "@/server/services/env";
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
      if (envConfig.nodeEnv === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return opts.ctx.service.encryption.decrypt(opts.input.payloadEncoded);
    }),
  encrypt: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .output(z.string())
    .query((opts) => {
      if (envConfig.nodeEnv === "production")
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return opts.ctx.service.encryption.encrypt(opts.input.text);
    }),
});
