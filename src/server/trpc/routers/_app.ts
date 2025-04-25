import { t } from "../server";
import { chatRouter } from "./chat";
import { chatBranchRouter } from "./chat-branch";
import { gratitudeJournalRouter } from "./gratitude-journal";
import { messageRouter } from "./message";
import { messageChunkRouter } from "./message-chunk";
import { messageReplyRouter } from "./message-reply";
import { promptRouter } from "./prompt";
import { userRouter } from "./user";
import { userPrefsRouter } from "./user-prefs";
import { userUsageLimitRouter } from "./user-usage-limit";

export const appRouter = t.router({
  user: userRouter,
  userPrefs: userPrefsRouter,
  userUsageLimit: userUsageLimitRouter,
  chat: chatRouter,
  chatBranch: chatBranchRouter,
  message: messageRouter,
  messageChunk: messageChunkRouter,
  messageReply: messageReplyRouter,
  prompt: promptRouter,
  gratitudeJournal: gratitudeJournalRouter,
});

export type AppRouter = typeof appRouter;
