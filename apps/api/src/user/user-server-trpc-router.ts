import { Injectable } from "@nestjs/common";
import { ApiKeyTrpcProcedure } from "../api-key/api-key-trpc-procedure.js";
import { TrpcService } from "../trpc/trpc-service.js";
import {
  UserData,
  UserGet,
  UserSignUpIn,
  UserSignUpInOutput,
} from "./user-schemas.js";
import { UserService } from "./user-service.js";

@Injectable()
export class UserServerTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    apiKeyTrpcProcedure: ApiKeyTrpcProcedure,
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
    });
  }
}
