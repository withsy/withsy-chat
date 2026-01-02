import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserData, UserUpdate } from "./user-schemas.js";
import { UserService } from "./user-service.js";
import { UserTrpcProcedure } from "./user-trpc-procedure.js";

@Injectable()
export class UserTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcProcedure: UserTrpcProcedure,
    userService: UserService,
  ) {
    this.router = trpcService.trpc.router({
      update: userTrpcProcedure.procedure
        .input(UserUpdate)
        .output(UserData)
        .mutation(({ ctx, input }) => userService.update(ctx.userId, input)),
    });
  }
}
