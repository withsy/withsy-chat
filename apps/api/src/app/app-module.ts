import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { GracefulShutdownModule } from "@tygra/nestjs-graceful-shutdown";
import { AiMessageModule } from "../ai-message/ai-message.module.js";
import { ApiKeyModule } from "../api-key/api-key-module.js";
import { ChatChunkModule } from "../chat-chunk/chat-chunk-module.js";
import { ChatMessageModule } from "../chat-message/chat-message-module.js";
import { ChatModule } from "../chat/chat-module.js";
import { ConfigModule } from "../config/config-module.js";
import { DbModule } from "../db/db-module.js";
import { E8nModule } from "../e8n/e8n-module.js";
import { GoogleGenAiModule } from "../google-gen-ai/google-gen-ai-module.js";
import { ShutdownModule } from "../shutdown/shutdown-module.js";
import { TrpcModule } from "../trpc/trpc-module.js";
import { UserAiProfileModule } from "../user-ai-profile/user-ai-profile-module.js";
import { UserDefaultPromptModule } from "../user-default-prompt/user-default-prompt-module.js";
import { UserLinkAccountModule } from "../user-link-account/user-link-account-module.js";
import { UserPromptModule } from "../user-prompt/user-prompt-module.js";
import { UserModule } from "../user/user-module.js";
import { XaiModule } from "../xai/xai-module.js";
import { AppTrpcRouter } from "./app-trpc-router.js";

@Module({
  imports: [
    ConfigModule,
    GracefulShutdownModule.forRoot(),
    DbModule,
    ShutdownModule,
    TrpcModule,
    ApiKeyModule,
    E8nModule,
    UserModule,
    UserPromptModule,
    UserDefaultPromptModule,
    UserAiProfileModule,
    UserLinkAccountModule,
    ChatModule,
    ChatMessageModule,
    ChatChunkModule,
    GoogleGenAiModule,
    XaiModule,
    AiMessageModule,
  ],
  providers: [AppTrpcRouter],
})
export class AppModule implements NestModule {
  constructor(private readonly appTrpcRouter: AppTrpcRouter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.appTrpcRouter.createMiddleware()).forRoutes("/trpc");
  }
}
