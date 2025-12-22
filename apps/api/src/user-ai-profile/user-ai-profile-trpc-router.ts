import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";

@Injectable()
export class UserAiProfileTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcProcedure: UserTrpcProcedure) {
    this.router = trpcService.trpc.router({});
  }
}
