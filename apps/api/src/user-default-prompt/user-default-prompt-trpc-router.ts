import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";

@Injectable()
export class UserDefaultPromptTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcProcedure: UserTrpcProcedure) {
    this.router = trpcService.trpc.router({
      get: userTrpcProcedure.procedure.query(() => {}),
    });
  }
}
