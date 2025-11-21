import { apiKeyRouter } from "../api-key/api-key.router";
import { chatBranchRouter } from "../chat-branch/chat-branch.router";
import { chatRouter } from "../chat/chat.router";
import { gratitudeJournalRouter } from "../gratitude-journal/gratitude-journal.router";
import { messageReplyRouter } from "../message-reply/message-reply.router";
import { messageRouter } from "../message/message.router";
import { tickRouter } from "../tick/tick.router";
import { t } from "../trpc/server";
import { userAiProfileRouter } from "../user-ai-profile/user-ai-profile.router";
import { userDefaultPromptRouter } from "../user-default-prompt/user-default-prompt.router";
import { userPromptRouter } from "../user-prompt/user-prompt.router";
import { userUsageLimitRouter } from "../user-usage-limit/user-usage-limit.router";
import { userRouter } from "../user/user.router";

export const appRouter = t.router({
  user: userRouter,
  userUsageLimit: userUsageLimitRouter,
  userPrompt: userPromptRouter,
  userDefaultPrompt: userDefaultPromptRouter,
  userAiProfile: userAiProfileRouter,
  chat: chatRouter,
  chatBranch: chatBranchRouter,
  message: messageRouter,
  messageReply: messageReplyRouter,
  gratitudeJournal: gratitudeJournalRouter,
  tick: tickRouter,
  apiKey: apiKeyRouter,
});

export type AppRouter = typeof appRouter;
