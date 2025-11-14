import { ChatStartOutput } from "@/types/chat";
import {
  GratitudeJournalData,
  GratitudeJournalGetJournal,
  GratitudeJournalStartChat,
  GratitudeJournalStats,
} from "@/types/gratitude-journal";
import { publicProcedure, t } from "../server";

export const gratitudeJournalRouter = t.router({
  getStats: publicProcedure.output(GratitudeJournalStats).query(({ ctx }) =>
    ctx.diContainer
      .get("gratitudeJournalService")
      .getStats(ctx.userId)
      .then((x) => GratitudeJournalStats.parse(x))
  ),
  getJournal: publicProcedure
    .input(GratitudeJournalGetJournal)
    .output(GratitudeJournalData)
    .query(({ ctx, input }) =>
      ctx.diContainer
        .get("gratitudeJournalService")
        .getJournal(ctx.userId, input)
        .then((x) => GratitudeJournalData.parse(x))
    ),
  startChat: publicProcedure
    .input(GratitudeJournalStartChat)
    .output(ChatStartOutput)
    .mutation(({ ctx, input }) =>
      ctx.diContainer
        .get("gratitudeJournalService")
        .startChat(ctx.userId, input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
