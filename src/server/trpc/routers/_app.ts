import { t } from "../server";
import { chatRouter } from "./chat";
import { chatBranchRouter } from "./chat-branch";
import { messageRouter } from "./message";
import { messageChunkRouter } from "./message-chunk";
import { messageReplyRouter } from "./message-reply";
import { promptRouter } from "./prompt";
import { userPrefsRouter } from "./user-prefs";
import { userUsageLimitRouter } from "./user-usage-limit";

export const appRouter = t.router({
  userPrefs: userPrefsRouter,
  userUsageLimit: userUsageLimitRouter,
  chat: chatRouter,
  chatBranch: chatBranchRouter,
  message: messageRouter,
  messageChunk: messageChunkRouter,
  messageReply: messageReplyRouter,
  prompt: promptRouter,
});

export type AppRouter = typeof appRouter;
