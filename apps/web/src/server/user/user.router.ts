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
  get: userProcedure
    .output(UserData)
    .query(({ ctx }) =>
      new UserServiceFactory(ctx.serverContext).create().get(ctx.userId)
    ),
  ensure: userProcedure
    .input(UserEnsure)
    .output(UserData)
    .mutation(({ ctx, input }) =>
      new UserServiceFactory(ctx.serverContext)
        .create()
        .ensure(ctx.userId, input)
    ),
  updatePreferences: userProcedure
    .input(UserUpdatePreferences)
    .output(UserUpdatePreferencesOutput)
    .mutation(({ ctx, input }) =>
      new UserServiceFactory(ctx.serverContext)
        .create()
        .updatePreferences(ctx.userId, input)
    ),
  update: userProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation(({ ctx, input }) =>
      new UserServiceFactory(ctx.serverContext)
        .create()
        .update(ctx.userId, input)
    ),
});
