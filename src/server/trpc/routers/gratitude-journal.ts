import {
  GratitudeJournal,
  GratitudeJournalList,
  GratitudeJournalStart,
} from "@/types/gratitude-journal";
import { publicProcedure, t } from "../server";

export const gratitudeJournalRouter = t.router({
  list: publicProcedure
    .input(GratitudeJournalList)
    .output(GratitudeJournal.array())
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => GratitudeJournal.parse(x)))
    ),
  start: publicProcedure
    .input(GratitudeJournalStart)
    .output(GratitudeJournal)
    .mutation(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .start(opts.ctx.userId, opts.input)
        .then((x) => GratitudeJournal.parse(x))
    ),
});
