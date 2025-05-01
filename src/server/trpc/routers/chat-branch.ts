import { Chat, ChatBranch } from "@/types";
import { publicProcedure, t } from "../server";

export const chatBranchRouter = t.router({
  list: publicProcedure
    .input(ChatBranch.List)
    .output(Chat.ListOutout)
    .query((opts) =>
      opts.ctx.service.chatBranch
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => Chat.Data.parse(x)))
    ),
  start: publicProcedure
    .input(ChatBranch.Start)
    .output(Chat.Data)
    .mutation((opts) =>
      opts.ctx.service.chatBranch
        .start(opts.ctx.userId, opts.input)
        .then((x) => Chat.Data.parse(x))
    ),
});
