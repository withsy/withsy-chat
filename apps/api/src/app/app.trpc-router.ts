import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { ChatTrpcRouter } from "src/chat/chat.trpc-router";
import { MessageTrpcRouter } from "src/message/message.trpc-router";
import { TrpcService } from "src/trpc/trpc.service";
import { UserTrpcRouter } from "src/user/user.trpc-router";

@Injectable()
export class AppTrpcRouter {
  readonly router;

  constructor(
    trpcService: TrpcService,
    userTrpcRouter: UserTrpcRouter,
    chatTrpcRouter: ChatTrpcRouter,
    messageTrpcRouter: MessageTrpcRouter
  ) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
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
