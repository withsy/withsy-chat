import { Chat } from "@/types/chat";
import { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import { publicProcedure, t } from "../server";

export const chatBranchRouter = t.router({
  list: publicProcedure
    .input(ChatBranchList)
    .output(Chat.array())
    .query((opts) =>
      opts.ctx.service.chatBranch
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => Chat.parse(x)))
    ),
  start: publicProcedure
    .input(ChatBranchStart)
    .output(Chat)
    .mutation((opts) =>
      opts.ctx.service.chatBranch
        .start(opts.ctx.userId, opts.input)
        .then((x) => Chat.parse(x))
    ),
});
