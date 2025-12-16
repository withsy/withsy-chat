import { Injectable } from "@nestjs/common";
import { ApiKeyTrpcProcedure } from "src/api-key/api-key.trpc-procedure";
import { TrpcService } from "src/trpc/trpc.service";
import { UserLogin, UserLoginOutput } from "./user-schemas";
import { UserService } from "./user.service";

@Injectable()
export class UserTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    apiKeyTrpcProcedure: ApiKeyTrpcProcedure,
    userService: UserService
  ) {
    this.router = trpcService.trpc.router({
      login: apiKeyTrpcProcedure.procedure
        .input(UserLogin)
        .output(UserLoginOutput)
        .mutation((opts) => userService.login(opts.input)),
    });
  }
}
