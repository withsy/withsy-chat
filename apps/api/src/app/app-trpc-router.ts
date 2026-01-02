import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ChatChunkTrpcRouter } from "../chat-chunk/chat-chunk-trpc-router.js";
import { ChatMessageTrpcRouter } from "../chat-message/chat-message-trpc-router.js";
import { ChatTrpcRouter } from "../chat/chat-trpc-router.js";
import { TrpcService } from "../trpc/trpc-service.js";
import { UserDefaultPromptTrpcRouter } from "../user-default-prompt/user-default-prompt-trpc-router.js";
import { UserPromptTrpcRouter } from "../user-prompt/user-prompt-trpc-router.js";
import { UserServerTrpcRouter } from "../user/user-server-trpc-router.js";
import { UserTrpcRouter } from "../user/user-trpc-router.js";

@Injectable()
export class AppTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcRouter: UserTrpcRouter,
    userPromptTrpcRouter: UserPromptTrpcRouter,
    userDefaultPromptTrpcRouter: UserDefaultPromptTrpcRouter,
    chatTrpcRouter: ChatTrpcRouter,
    chatMessageTrpcRouter: ChatMessageTrpcRouter,
    chatChunkTrpcRouter: ChatChunkTrpcRouter,
    userServerTrpcRouter: UserServerTrpcRouter,
  ) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
      userServer: userServerTrpcRouter.router,
      userPrompt: userPromptTrpcRouter.router,
      userDefaultPrompt: userDefaultPromptTrpcRouter.router,
      chat: chatTrpcRouter.router,
      chatMessage: chatMessageTrpcRouter.router,
      chatChunk: chatChunkTrpcRouter.router,
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
