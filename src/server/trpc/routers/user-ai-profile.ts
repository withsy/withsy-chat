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
    .query(({ ctx, input }) =>
      ctx.diContainer.get("userAiProfileService").get(ctx.userId, input)
    ),
  getAll: publicProcedure
    .output(UserAiProfileGetAllOutput)
    .query(({ ctx }) =>
      ctx.diContainer.get("userAiProfileService").getAll(ctx.userId)
    ),
  deleteImage: publicProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation(({ ctx, input }) =>
      ctx.diContainer.get("userAiProfileService").deleteImage(ctx.userId, input)
    ),
});
