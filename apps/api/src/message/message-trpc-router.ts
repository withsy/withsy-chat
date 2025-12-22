import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service";
import { UserTrpcProcedure } from "../user/user-trpc-procedure";

@Injectable()
export class MessageTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcProcedure: UserTrpcProcedure) {
    this.router = trpcService.trpc.router({
      regenerateReply: userTrpcProcedure.procedure.mutation(() => {}),
      update: userTrpcProcedure.procedure.mutation(() => {}),
      list: userTrpcProcedure.procedure.query(() => {}),
    });
  }
}
