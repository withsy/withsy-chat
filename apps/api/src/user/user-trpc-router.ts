import { Injectable } from "@nestjs/common";
import { RawUserPreferences } from "@repo/api-shared";
import { ApiKeyTrpcProcedure } from "../api-key/api-key-trpc-procedure";
import { TrpcService } from "../trpc/trpc-service";
import {
  UserData,
  UserGet,
  UserSignUpIn,
  UserSignUpInOutput,
  UserUpdate,
} from "./user-schemas";
import { UserService } from "./user-service";
import { UserTrpcProcedure } from "./user-trpc-procedure";

@Injectable()
export class UserTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    apiKeyTrpcProcedure: ApiKeyTrpcProcedure,
    userTrpcProcedure: UserTrpcProcedure,
    userService: UserService,
  ) {
    this.router = trpcService.trpc.router({
      signUpIn: apiKeyTrpcProcedure.procedure
        .input(UserSignUpIn)
        .output(UserSignUpInOutput)
        .mutation(({ input }) => userService.signUpIn(input)),
      get: apiKeyTrpcProcedure.procedure
        .input(UserGet)
        .output(UserData)
        .query(({ input }) => userService.get(input)),
      update: userTrpcProcedure.procedure
        .input(UserUpdate)
        .output(UserData)
        .mutation(({ ctx, input }) => userService.update(ctx.userId, input)),
    });
  }
}
