import { Injectable } from "@nestjs/common";
import { ApiKeyTrpcProcedure } from "src/api-key/api-key.trpc-procedure";
import { TrpcService } from "src/trpc/trpc.service";
import {
  UserGetPreferences,
  UserLogin,
  UserLoginOutput,
  UserPreferencesRaw,
  UserUpdatePreferences,
} from "./user-schemas";
import { UserService } from "./user.service";
import { UserTrpcProcedure } from "./user.trpc-procedure";

@Injectable()
export class UserTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    apiKeyTrpcProcedure: ApiKeyTrpcProcedure,
    userTrpcProcedure: UserTrpcProcedure,
    userService: UserService
  ) {
    this.router = trpcService.trpc.router({
      login: apiKeyTrpcProcedure.procedure
        .input(UserLogin)
        .output(UserLoginOutput)
        .mutation(({ input }) => userService.login(input)),
      getPreferences: apiKeyTrpcProcedure.procedure
        .input(UserGetPreferences)
        .output(UserPreferencesRaw)
        .query(({ input }) => userService.getPreferences(input)),
      updatePreferences: userTrpcProcedure.procedure
        .input(UserUpdatePreferences)
        .output(UserPreferencesRaw)
        .mutation(({ ctx, input }) =>
          userService.updatePreferences(ctx.userId, input)
        ),
    });
  }
}
