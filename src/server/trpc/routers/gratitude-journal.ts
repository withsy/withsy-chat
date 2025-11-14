import { ChatStartOutput } from "@/types/chat";
import {
  GratitudeJournalData,
  GratitudeJournalGetJournal,
  GratitudeJournalStartChat,
  GratitudeJournalStats,
} from "@/types/gratitude-journal";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const gratitudeJournalRouter = t.router({
  getStats: publicProcedure.output(GratitudeJournalStats).query((opts) =>
    inject("gratitudeJournalService")
      .getStats(opts.ctx.userId)
      .then((x) => GratitudeJournalStats.parse(x))
  ),
  getJournal: publicProcedure
    .input(GratitudeJournalGetJournal)
    .output(GratitudeJournalData)
    .query((opts) =>
      inject("gratitudeJournalService")
        .getJournal(opts.ctx.userId, opts.input)
        .then((x) => GratitudeJournalData.parse(x))
    ),
  startChat: publicProcedure
    .input(GratitudeJournalStartChat)
    .output(ChatStartOutput)
    .mutation((opts) =>
      inject("gratitudeJournalService")
        .startChat(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
