import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ChatMessageTrpcRouter } from "src/chat-message/chat-message.trpc-router";
import { ChatTrpcRouter } from "src/chat/chat.trpc-router";
import { TrpcService } from "src/trpc/trpc.service";
import { UserAiProfileTrpcRouter } from "src/user-ai-profile/user-ai-profile.trpc-router";
import { UserDefaultPromptTrpcRouter } from "src/user-default-prompt/user-default-prompt.trpc-router";
import { UserPromptTrpcRouter } from "src/user-prompt/user-prompt.trpc-router";
import { UserTrpcRouter } from "src/user/user.trpc-router";

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
    chatMessageTrpcRouter: ChatMessageTrpcRouter
  ) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
      userProfile: userPromptTrpcRouter.router,
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
