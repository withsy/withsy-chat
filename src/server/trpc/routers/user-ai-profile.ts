import {
  UserAiProfileData,
  UserAiProfileDeleteImage,
  UserAiProfileGet,
  UserAiProfileGetAllOutput,
  UserAiProfileGetOutput,
} from "@/types/user-ai-profile";
import { publicProcedure, t } from "../server";

export const userAiProfileRouter = t.router({
  get: publicProcedure
    .input(UserAiProfileGet)
    .output(UserAiProfileGetOutput)
    .query((opts) =>
      opts.ctx.container
        .get("userAiProfileService")
        .get(opts.ctx.userId, opts.input)
    ),
  getAll: publicProcedure
    .output(UserAiProfileGetAllOutput)
    .query((opts) =>
      opts.ctx.container.get("userAiProfileService").getAll(opts.ctx.userId)
    ),
  deleteImage: publicProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation((opts) =>
      opts.ctx.container
        .get("userAiProfileService")
        .deleteImage(opts.ctx.userId, opts.input)
    ),
});
