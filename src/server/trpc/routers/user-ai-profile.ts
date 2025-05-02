import { UserAiProfile } from "@/types";
import fs from "node:fs";
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
      z.instanceof(FormData)
      // .transform((fd) => Object.fromEntries(fd.entries()))
      // .pipe(UserAiProfile.Update)
    )
    // .output(UserAiProfile.Data)
    .mutation(async (opts) => {
      const image = opts.input.get("image");
      if (image instanceof File) {
        console.log(image);
        const a = await image.arrayBuffer();
        await fs.promises.writeFile(image.name, Buffer.from(a));
      }
      // opts.ctx.service.userAiProfile.update(opts.ctx.userId, opts.input)
    }),
  deleteImage: publicProcedure
    .input(UserAiProfile.DeleteImage)
    .output(UserAiProfile.Data)
    .mutation((opts) =>
      opts.ctx.service.userAiProfile.deleteImage(opts.ctx.userId, opts.input)
    ),
});
