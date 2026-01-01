import { Injectable } from "@nestjs/common";
import { ApiKeyTrpcProcedure } from "../api-key/api-key-trpc-procedure.js";
import { TrpcService } from "../trpc/trpc-service.js";
import {
  UserData,
  UserSignUpIn,
  UserSignUpInOutput,
  UserUpdate,
} from "./user-schemas.js";
import { UserService } from "./user-service.js";
import { UserTrpcProcedure } from "./user-trpc-procedure.js";

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
      update: userTrpcProcedure.procedure
        .input(UserUpdate)
        .output(UserData)
        .mutation(({ ctx, input }) => userService.update(ctx.userId, input)),
    });
  }
}
