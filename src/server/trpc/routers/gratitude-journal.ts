import { ChatStartOutput } from "@/types/chat";
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
  startChat: publicProcedure
    .input(GratitudeJournalStart)
    .output(ChatStartOutput)
    .mutation(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .startChat(opts.ctx.userId, opts.input)
        .then((x) => ChatStartOutput.parse(x))
    ),
});
