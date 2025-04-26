import { GratitudeJournal } from "@/types";
import { ChatStartOutput } from "@/types/chat";
import { publicProcedure, t } from "../server";

export const gratitudeJournalRouter = t.router({
  getStats: publicProcedure
    .output(GratitudeJournal.Stats)
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .getStats(opts.ctx.userId)
        .then((x) => GratitudeJournal.Stats.parse(x))
    ),
  getJournal: publicProcedure
    .input(GratitudeJournal.GetJournal)
    .output(GratitudeJournal.Data)
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .getJournal(opts.ctx.userId, opts.input)
        .then((x) => GratitudeJournal.Data.parse(x))
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
