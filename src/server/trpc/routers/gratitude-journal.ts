import { GratitudeJournal } from "@/types";
import { ChatStartOutput } from "@/types/chat";
import { publicProcedure, t } from "../server";

export const gratitudeJournalRouter = t.router({
  list: publicProcedure
    .output(GratitudeJournal.Data.array())
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .list(opts.ctx.userId)
        .then((xs) => xs.map((x) => GratitudeJournal.Data.parse(x)))
    ),
  getTodayJournal: publicProcedure
    .output(GratitudeJournal.GetTodayJournalOutput)
    .query(async (opts) =>
      opts.ctx.service.gratitudeJournal
        .getTodayJournal(opts.ctx.userId)
        .then((x) => GratitudeJournal.GetTodayJournalOutput.parse(x))
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
