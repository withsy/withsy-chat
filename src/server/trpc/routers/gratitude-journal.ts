import { ChatStartOutput } from "@/types/chat";
import {
  GratitudeJournalData,
  GratitudeJournalGetJournal,
  GratitudeJournalStartChat,
  GratitudeJournalStats,
} from "@/types/gratitude-journal";
import { publicProcedure, t } from "../server";

export const gratitudeJournalRouter = t.router({
  getStats: publicProcedure
    .output(GratitudeJournalStats)
    .query(({ ctx }) =>
      ctx.serviceRegistry.gratitudeJournalService
        .getStats(ctx.userId)
        .then((x) => GratitudeJournalStats.parse(x))
    ),
  getJournal: publicProcedure
    .input(GratitudeJournalGetJournal)
    .output(GratitudeJournalData)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.gratitudeJournalService
        .getJournal(ctx.userId, input)
        .then((x) => GratitudeJournalData.parse(x))
    ),
  startChat: publicProcedure
    .input(GratitudeJournalStartChat)
    .output(ChatStartOutput)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.gratitudeJournalChatStarter
        .start(ctx.userId, input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
