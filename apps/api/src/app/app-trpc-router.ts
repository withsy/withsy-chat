import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ChatTrpcRouter } from "../chat/chat-trpc-router";
import { MessageTrpcRouter } from "../message/message-trpc-router";
import { TrpcService } from "../trpc/trpc-service";
import { UserAiProfileTrpcRouter } from "../user-ai-profile/user-ai-profile-trpc-router";
import { UserDefaultPromptTrpcRouter } from "../user-default-prompt/user-default-prompt-trpc-router";
import { UserPromptTrpcRouter } from "../user-prompt/user-prompt-trpc-router";
import { UserTrpcRouter } from "../user/user-trpc-router";

@Injectable()
export class AppTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcRouter: UserTrpcRouter,
    userPromptTrpcRouter: UserPromptTrpcRouter,
    userDefaultPromptTrpcRouter: UserDefaultPromptTrpcRouter,
    userAiProfileTrpcRouter: UserAiProfileTrpcRouter,
    chatTrpcRouter: ChatTrpcRouter,
    messageTrpcRouter: MessageTrpcRouter,
  ) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
      userPrompt: userPromptTrpcRouter.router,
      userDefaultPrompt: userDefaultPromptTrpcRouter.router,
      userAiProfile: userAiProfileTrpcRouter.router,
      chat: chatTrpcRouter.router,
      message: messageTrpcRouter.router,
    });
  }

  createMiddleware() {
    return createExpressMiddleware({
      router: this.router,
      createContext: (opts) => {
        const { req } = opts;
        return {
          req,
        };
      },
    });
  }
}

export type AppRouter = AppTrpcRouter["router"];
