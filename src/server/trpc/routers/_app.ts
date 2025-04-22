import { t } from "../server";
import { branchRouter } from "./branch";
import { chatRouter } from "./chat";
import { messageRouter } from "./message";
import { messageChunkRouter } from "./message-chunk";
import { replyRouter } from "./reply";
import { userPrefsRouter } from "./user-prefs";

export const appRouter = t.router({
  userPrefs: userPrefsRouter,
  chat: chatRouter,
  branch: branchRouter,
  message: messageRouter,
  messageChunk: messageChunkRouter,
  reply: replyRouter,
});

export type AppRouter = typeof appRouter;
