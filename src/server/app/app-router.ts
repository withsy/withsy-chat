import { t } from "../trpc/server";
import { userRouter } from "../user/user.router";
import { userUsageLimitRouter } from "../user-usage-limit/user-usage-limit.router";
import { userPromptRouter } from "../user-prompt/user-prompt.router";
import { userDefaultPromptRouter } from "../user-default-prompt/user-default-prompt.router";
import { userAiProfileRouter } from "../user-ai-profile/user-ai-profile.router";
import { chatRouter } from "../chat/chat.router";
import { chatBranchRouter } from "../chat-branch/chat-branch.router";
import { messageRouter } from "../message/message.router";
import { messageReplyRouter } from "../message-reply/message-reply.router";
import { gratitudeJournalRouter } from "../gratitude-journal/gratitude-journal.router";
import { tickRouter } from "../tick/tick.router";

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
});

export type AppRouter = typeof appRouter;
