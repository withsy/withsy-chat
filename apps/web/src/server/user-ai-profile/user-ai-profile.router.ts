import {
  UserAiProfileData,
  UserAiProfileDeleteImage,
  UserAiProfileListOutput,
} from "@/types/user-ai-profile";
import { t, userProcedure } from "../trpc/server";
import { UserAiProfileServiceFactory } from "./user-ai-profile.service-factory";

export const userAiProfileRouter = t.router({
  list: userProcedure
    .output(UserAiProfileListOutput)
    .query(({ ctx }) =>
      new UserAiProfileServiceFactory(ctx.serverContext)
        .create()
        .list({ userId: ctx.userId })
    ),
  deleteImage: userProcedure
    .input(UserAiProfileDeleteImage)
    .output(UserAiProfileData)
    .mutation(({ ctx, input }) =>
      new UserAiProfileServiceFactory(ctx.serverContext)
        .create()
        .deleteImage(ctx.userId, input)
    ),
});
