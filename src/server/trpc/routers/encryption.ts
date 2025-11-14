import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

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
      return inject("encryptionService").decrypt(opts.input.payloadEncoded);
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
      return inject("encryptionService").encrypt(opts.input.text);
    }),
});
