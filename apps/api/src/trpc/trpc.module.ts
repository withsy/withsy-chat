import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TrpcRouterService } from "./trpc-router.service";
import { TrpcService } from "./trpc.service";

@Module({
  providers: [TrpcService, TrpcRouterService],
})
export class TrpcModule implements NestModule {
  constructor(private readonly trpcRouterService: TrpcRouterService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.trpcRouterService.createMiddleware())
      .forRoutes("/trpc");
  }
}
