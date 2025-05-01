import { Chat } from "@/types";
import { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import { z } from "zod";
import { publicProcedure, t } from "../server";

export const chatBranchRouter = t.router({
  list: publicProcedure
    .input(ChatBranchList)
    .output(z.array(Chat.Data))
    .query((opts) =>
      opts.ctx.service.chatBranch
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => Chat.Data.parse(x)))
    ),
  start: publicProcedure
    .input(ChatBranchStart)
    .output(Chat.Data)
    .mutation((opts) =>
      opts.ctx.service.chatBranch
        .start(opts.ctx.userId, opts.input)
        .then((x) => Chat.Data.parse(x))
    ),
});
