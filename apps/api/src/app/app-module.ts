import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";
import { ApiKeyModule } from "../api-key/api-key-module";
import { ChatMessageModule } from "../chat-message/chat-message-module";
import { ChatModule } from "../chat/chat-module";
import { ConfigModule } from "../config/config-module";
import { DbModule } from "../db/db-module";
import { EncryptionModule } from "../encryption/encryption-module";
import { ShutdownModule } from "../shutdown/shutdown-module";
import { TrpcModule } from "../trpc/trpc-module";
import { UserAiProfileModule } from "../user-ai-profile/user-ai-profile-module";
import { UserDefaultPromptModule } from "../user-default-prompt/user-default-prompt-module";
import { UserLinkAccountModule } from "../user-link-account/user-link-account-module";
import { UserPromptModule } from "../user-prompt/user-prompt-module";
import { UserModule } from "../user/user-module";
import { AppTrpcRouter } from "./app-trpc-router";

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    DbModule,
    ShutdownModule,
    TrpcModule,
    ApiKeyModule,
    EncryptionModule,
    UserModule,
    UserPromptModule,
    UserDefaultPromptModule,
    UserAiProfileModule,
    UserLinkAccountModule,
    ChatModule,
    ChatMessageModule,
  ],
  providers: [AppTrpcRouter],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes("/trpc");
  }
}
