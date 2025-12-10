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
    return new UserServiceFactory(serverContext).create().get(userId);
  }),
  ensure: userProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserServiceFactory(serverContext)
        .create()
        .ensure(userId, input);
    }),
  updatePreferences: userProcedure
    .input(UserUpdatePreferences)
    .output(UserUpdatePreferencesOutput)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserServiceFactory(serverContext)
        .create()
        .updatePreferences(userId, input);
    }),
  update: userProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation(({ ctx, input }) => {
      const { serverContext, userId } = ctx;
      return new UserServiceFactory(serverContext)
        .create()
        .update(userId, input);
    }),
});
