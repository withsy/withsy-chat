import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";
import { ApiKeyModule } from "src/api-key/api-key.module";
import { ChatModule } from "src/chat/chat.module";
import { ConfigModule } from "src/config/config.module";
import { DbModule } from "src/db/db.module";
import { EncryptionModule } from "src/encryption/encryption.module";
import { MessageModule } from "src/message/message.module";
import { RefreshTokenModule } from "src/refresh-token/refresh-token.module";
import { ShutdownModule } from "src/shutdown/shutdown.module";
import { TrpcModule } from "src/trpc/trpc.module";
import { UserLinkAccountModule } from "src/user-link-account/user-link-account.module";
import { UserModule } from "src/user/user.module";
import { AppTrpcRouter } from "./app.trpc-router";

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    DbModule,
    ShutdownModule,
    TrpcModule,
    UserModule,
    ApiKeyModule,
    EncryptionModule,
    UserLinkAccountModule,
    RefreshTokenModule,
    ChatModule,
    MessageModule,
  ],
  providers: [AppTrpcRouter],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes("/trpc");
  }
}
