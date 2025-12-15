import { Injectable } from "@nestjs/common";
import { TrpcService } from "src/trpc/trpc.service";

@Injectable()
export class UserTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService) {
    this.router = trpcService.trpc.router({});
  }
}
