import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ChatMessageTrpcRouter } from "../chat-message/chat-message-trpc-router.js";
import { ChatTrpcRouter } from "../chat/chat-trpc-router.js";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserAiProfileTrpcRouter } from "../user-ai-profile/user-ai-profile-trpc-router.js";
import { UserDefaultPromptTrpcRouter } from "../user-default-prompt/user-default-prompt-trpc-router.js";
import { UserPromptTrpcRouter } from "../user-prompt/user-prompt-trpc-router.js";
import { UserTrpcRouter } from "../user/user-trpc-router.js";

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
    chatMessageTrpcRouter: ChatMessageTrpcRouter,
  ) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
      userPrompt: userPromptTrpcRouter.router,
      userDefaultPrompt: userDefaultPromptTrpcRouter.router,
      userAiProfile: userAiProfileTrpcRouter.router,
      chat: chatTrpcRouter.router,
      chatMessage: chatMessageTrpcRouter.router,
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
