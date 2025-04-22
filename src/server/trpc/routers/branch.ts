import { BranchList, BranchStart } from "@/types/branch";
import { Chat } from "@/types/chat";
import { publicProcedure, t } from "../server";

export const branchRouter = t.router({
  list: publicProcedure
    .input(BranchList)
    .output(Chat.array())
    .query(async (opts) =>
      opts.ctx.service.branch
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => Chat.parse(x)))
    ),
  start: publicProcedure
    .input(BranchStart)
    .output(Chat)
    .mutation(async (opts) =>
      opts.ctx.service.branch
        .start(opts.ctx.userId, opts.input)
        .then((x) => Chat.parse(x))
    ),
});
