import { t } from "src/trpc/trpc-server";

export const appRouter = t.router({
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

export type AppRouter = typeof appRouter;
