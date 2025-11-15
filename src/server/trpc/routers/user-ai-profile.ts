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
      ctx.serviceRegistry.userAiProfileService.get(ctx.userId, input)
    ),
  getAll: publicProcedure
    .output(UserAiProfileGetAllOutput)
    .query(({ ctx }) =>
      ctx.serviceRegistry.userAiProfileService.getAll(ctx.userId)
    ),
  deleteImage: publicProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.userAiProfileService.deleteImage(ctx.userId, input)
    ),
});
