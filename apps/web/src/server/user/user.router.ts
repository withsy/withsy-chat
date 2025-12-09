import {
  UserData,
  UserEnsure,
  UserUpdate,
  UserUpdatePreferences,
  UserUpdatePreferencesOutput,
} from "@/types/user";
import { t, userProcedure } from "../trpc/server";
import { UserServiceFactory } from "./user.service-factory";

export const userRouter = t.router({
  get: userProcedure.output(UserData).query(({ ctx }) => {
    const { serverContext, userId } = ctx;
    return new UserServiceFactory(serverContext)
      .createUserService()
      .getUser(userId);
  }),
  ensure: userProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserServiceFactory(serverContext)
        .createUserService()
        .ensureUser(userId, input);
    }),
  updatePreferences: userProcedure
    .input(UserUpdatePreferences)
    .output(UserUpdatePreferencesOutput)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserServiceFactory(serverContext)
        .createUserService()
        .updateUserPreferences(userId, input);
    }),
  update: userProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserServiceFactory(serverContext)
        .createUserService()
        .updateUser(userId, input);
    }),
});
