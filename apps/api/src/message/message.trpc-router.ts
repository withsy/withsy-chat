import { Injectable } from "@nestjs/common";
import { TrpcService } from "src/trpc/trpc.service";
import { UserTrpcProcedure } from "src/user/user.trpc-procedure";

@Injectable()
export class MessageTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcProcedure: UserTrpcProcedure) {
    this.router = trpcService.trpc.router({
      regenerateReply: userTrpcProcedure.procedure.mutation(() => {}),
    });
  }
}
