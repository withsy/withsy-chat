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
    .query((opts) =>
      opts.ctx.service.gratitudeJournal
        .getStats(opts.ctx.userId)
        .then((x) => GratitudeJournalStats.parse(x))
    ),
  getJournal: publicProcedure
    .input(GratitudeJournalGetJournal)
    .output(GratitudeJournalData)
    .query((opts) =>
      opts.ctx.service.gratitudeJournal
        .getJournal(opts.ctx.userId, opts.input)
        .then((x) => GratitudeJournalData.parse(x))
    ),
  startChat: publicProcedure
    .input(GratitudeJournalStartChat)
    .output(ChatStartOutput)
    .mutation((opts) =>
      opts.ctx.service.gratitudeJournal
        .startChat(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
