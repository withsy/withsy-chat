import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { TrpcService } from "src/trpc/trpc.service";
import { UserTrpcRouter } from "src/user/user.trpc-router";

@Injectable()
export class AppTrpcRouter {
  readonly router;

  constructor(trpcService: TrpcService, userTrpcRouter: UserTrpcRouter) {
    this.router = trpcService.trpc.router({
      user: userTrpcRouter.router,
      // userUsageLimit: userUsageLimitRouter,
      // userPrompt: userPromptRouter,
      // userDefaultPrompt: userDefaultPromptRouter,
      // userAiProfile: userAiProfileRouter,
      // chat: chatRouter,
      // chatBranch: chatBranchRouter,
      // message: messageRouter,
      // messageReply: messageReplyRouter,
      // gratitudeJournal: gratitudeJournalRouter,
      // tick: tickRouter,
      // apiKey: apiKeyRouter,
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
