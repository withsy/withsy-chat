import { Injectable } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouterService {
  readonly appRouter;

  constructor(trpcService: TrpcService) {
    this.appRouter = trpcService.trpc.router({
      // user: userRouter,
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
      router: this.appRouter,
    });
  }
}

export type AppRouter = TrpcRouterService["appRouter"];
