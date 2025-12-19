import { Injectable } from "@nestjs/common";
import { TrpcService } from "src/trpc/trpc.service";
import { UserTrpcProcedure } from "src/user/user.trpc-procedure";

@Injectable()
export class UserAiProfileTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcProcedure: UserTrpcProcedure) {
    this.router = trpcService.trpc.router({});
  }
}
