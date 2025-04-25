import { GratitudeJournal } from "@/types";
import { ChatStartOutput } from "@/types/chat";
import { publicProcedure, t } from "../server";

export const gratitudeJournalRouter = t.router({
  getTodayJournal: publicProcedure
    .output(GratitudeJournal.TodayJournal)
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .getTodayJournal(opts.ctx.userId)
        .then((x) => GratitudeJournal.TodayJournal.parse(x))
    ),
  getStats: publicProcedure
    .output(GratitudeJournal.Stats)
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .getStats(opts.ctx.userId)
        .then((x) => GratitudeJournal.Stats.parse(x))
    ),
  getGrassCalendar: publicProcedure
    .output(GratitudeJournal.Calendar)
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .getGrassCalendar(opts.ctx.userId, opts.input)
        .then((x) => GratitudeJournal.Calendar.parse(x))
    ),
  startChat: publicProcedure
    .input(GratitudeJournal.StartChat)
    .output(ChatStartOutput)
    .mutation(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .startChat(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
