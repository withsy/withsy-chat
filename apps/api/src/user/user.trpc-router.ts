import { Injectable } from "@nestjs/common";
import { ApiKeyTrpcProcedure } from "src/api-key/api-key.trpc-procedure";
import { TrpcService } from "src/trpc/trpc.service";
import {
  UserLogin,
  UserLoginOutput,
  UserUpdatePreferences,
  UserUpdatePreferencesOutput,
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
      updatePreferences: userTrpcProcedure.procedure
        .input(UserUpdatePreferences)
        .output(UserUpdatePreferencesOutput)
        .mutation(({ ctx, input }) =>
          userService.updatePreferences(ctx.userId, input)
        ),
    });
  }
}
