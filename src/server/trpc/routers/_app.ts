import { t } from "../server";
import { chatRouter } from "./chat";
import { chatBranchRouter } from "./chat-branch";
import { gratitudeJournalRouter } from "./gratitude-journal";
import { messageRouter } from "./message";
import { messageChunkRouter } from "./message-chunk";
import { messageReplyRouter } from "./message-reply";
import { userRouter } from "./user";
import { userDefaultPromptRouter } from "./user-default-prompt";
import { userPromptRouter } from "./user-prompt";
import { userUsageLimitRouter } from "./user-usage-limit";

export const appRouter = t.router({
  user: userRouter,
  userUsageLimit: userUsageLimitRouter,
  userPrompt: userPromptRouter,
  userDefaultPrompt: userDefaultPromptRouter,
  chat: chatRouter,
  chatBranch: chatBranchRouter,
  message: messageRouter,
  messageChunk: messageChunkRouter,
  messageReply: messageReplyRouter,
  gratitudeJournal: gratitudeJournalRouter,
});

export type AppRouter = typeof appRouter;
