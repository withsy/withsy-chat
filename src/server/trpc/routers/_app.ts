import { t } from "../server";
import { chatRouter } from "./chat";
import { chatBranchRouter } from "./chat-branch";
import { encryptionRouter } from "./encryption";
import { gratitudeJournalRouter } from "./gratitude-journal";
import { messageRouter } from "./message";
import { messageReplyRouter } from "./message-reply";
import { userRouter } from "./user";
import { userAiProfileRouter } from "./user-ai-profile";
import { userDefaultPromptRouter } from "./user-default-prompt";
import { userPromptRouter } from "./user-prompt";
import { userUsageLimitRouter } from "./user-usage-limit";

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
  encryption: encryptionRouter,
});

export type AppRouter = typeof appRouter;
