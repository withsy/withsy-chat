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
    .query((opts) => inject("userAiProfile").get(opts.ctx.userId, opts.input)),
  getAll: publicProcedure
    .output(UserAiProfileGetAllOutput)
    .query((opts) => inject("userAiProfile").getAll(opts.ctx.userId)),
  deleteImage: publicProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation((opts) =>
      inject("userAiProfile").deleteImage(opts.ctx.userId, opts.input)
    ),
});
