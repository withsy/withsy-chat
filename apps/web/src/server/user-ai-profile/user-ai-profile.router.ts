import {
  UserAiProfileData,
  UserAiProfileDeleteImage,
  UserAiProfileGet,
  UserAiProfileGetAllOutput,
  UserAiProfileGetOutput,
} from "@/types/user-ai-profile";
import { t, userProcedure } from "../trpc/server";

export const userAiProfileRouter = t.router({
  get: userProcedure
    .input(UserAiProfileGet)
    .output(UserAiProfileGetOutput)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.userAiProfileService.get(ctx.userId, input)
    ),
  getAll: userProcedure
    .output(UserAiProfileGetAllOutput)
    .query(({ ctx }) =>
      ctx.serviceRegistry.userAiProfileService.getAll(ctx.userId)
    ),
  deleteImage: userProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.userAiProfileService.deleteImage(ctx.userId, input)
    ),
});
