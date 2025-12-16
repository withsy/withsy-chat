import { Injectable } from "@nestjs/common";
import { ApiKeyTrpcProcedure } from "src/api-key/api-key.trpc-procedure";
import { TrpcService } from "src/trpc/trpc.service";
import {
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
        .mutation((opts) => userService.login(opts.input)),
      getPreferences: userTrpcProcedure.procedure
        .output(UserPreferencesRaw)
        .query(({ ctx }) => userService.getPreferences(ctx.userId)),
      updatePreferences: userTrpcProcedure.procedure
        .input(UserUpdatePreferences)
        .output(UserPreferencesRaw)
        .mutation(({ ctx, input }) =>
          userService.updatePreferences(ctx.userId, input)
        ),
    });
  }
}
