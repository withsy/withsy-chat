import {
  UserAiProfileData,
  UserAiProfileDeleteImage,
  UserAiProfileGet,
  UserAiProfileGetAllOutput,
  UserAiProfileGetOutput,
} from "@/types/user-ai-profile";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const userAiProfileRouter = t.router({
  get: publicProcedure
    .input(UserAiProfileGet)
    .output(UserAiProfileGetOutput)
    .query((opts) =>
      inject("userAiProfileService").get(opts.ctx.userId, opts.input)
    ),
  getAll: publicProcedure
    .output(UserAiProfileGetAllOutput)
    .query((opts) => inject("userAiProfileService").getAll(opts.ctx.userId)),
  deleteImage: publicProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation((opts) =>
      inject("userAiProfileService").deleteImage(opts.ctx.userId, opts.input)
    ),
});
