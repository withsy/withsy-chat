import {
  UserData,
  UserEnsure,
  UserUpdate,
  UserUpdatePreferences,
  UserUpdatePreferencesOutput,
} from "@/types/user";
import z from "zod";
import { t, userProcedure } from "../trpc/server";

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
  update: userProcedure
    .input(UserUpdate)
    .output(UserData)
    .mutation(({ ctx, input }) =>
      new UserServiceFactory(ctx.serverContext)
        .create()
        .update(ctx.userId, input)
    ),
});
