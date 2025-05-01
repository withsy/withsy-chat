import { UserAiProfile } from "@/types";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const userAiProfileRouter = t.router({
  update: publicProcedure
    .input(
      z
        .instanceof(FormData)
        .transform((fd) => Object.fromEntries(fd.entries()))
        .pipe(UserAiProfile.Update)
    )
    .mutation((opts) =>
      opts.ctx.service.userAiProfile.update(opts.ctx.userId, opts.input)
    ),
});
