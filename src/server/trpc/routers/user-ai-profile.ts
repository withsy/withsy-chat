import { UserAiProfile } from "@/types";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const userAiProfileRouter = t.router({
  get: publicProcedure
    .input(UserAiProfile.Get)
    .output(UserAiProfile.GetOutput)
    .query((opts) =>
      opts.ctx.service.userAiProfile.get(opts.ctx.userId, opts.input)
    ),
  update: publicProcedure
    .input(
      z
        .instanceof(FormData)
        .transform((fd) => Object.fromEntries(fd.entries()))
        .pipe(UserAiProfile.Update)
    )
    .output(UserAiProfile.Data)
    .mutation((opts) =>
      opts.ctx.service.userAiProfile.update(opts.ctx.userId, opts.input)
    ),
  deleteImage: publicProcedure
    .input(UserAiProfile.DeleteImage)
    .output(UserAiProfile.Data)
    .mutation((opts) =>
      opts.ctx.service.userAiProfile.deleteImage(opts.ctx.userId, opts.input)
    ),
});
