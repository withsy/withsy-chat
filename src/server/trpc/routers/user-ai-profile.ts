import { UserAiProfile } from "@/types";
import { publicProcedure, t } from "../server";

export const userAiProfileRouter = t.router({
  get: publicProcedure
    .input(UserAiProfile.Get)
    .output(UserAiProfile.GetOutput)
    .query((opts) =>
      opts.ctx.service.userAiProfile.get(opts.ctx.userId, opts.input)
    ),
  getAll: publicProcedure
    .output(UserAiProfile.GetAllOutput)
    .query((opts) => opts.ctx.service.userAiProfile.getAll(opts.ctx.userId)),
  deleteImage: publicProcedure
    .input(UserAiProfile.DeleteImage)
    .output(UserAiProfile.Data)
    .mutation((opts) =>
      opts.ctx.service.userAiProfile.deleteImage(opts.ctx.userId, opts.input)
    ),
});
