import { Injectable } from "@nestjs/common";
import { TrpcService } from "src/trpc/trpc.service";
import { UserTrpcProcedure } from "src/user/user.trpc-procedure";

@Injectable()
export class ChatTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcProcedure: UserTrpcProcedure) {
    this.router = trpcService.trpc.router({
      list: userTrpcProcedure.procedure.query(() => {}),
      start: userTrpcProcedure.procedure.mutation(() => {}),
      update: userTrpcProcedure.procedure.mutation(() => {}),
      listBranch: userTrpcProcedure.procedure.query(() => {}),
      startBranch: userTrpcProcedure.procedure.mutation(() => {}),
    });
  }
}
