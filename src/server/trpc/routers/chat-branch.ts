import { ChatData, ChatListOutout } from "@/types/chat";
import { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import { publicProcedure, t } from "../server";
import { inject } from "@/server/service-registry";

export const chatBranchRouter = t.router({
  list: publicProcedure
    .input(ChatBranchList)
    .output(ChatListOutout)
    .query((opts) =>
      inject("chatBranchService")
        .list(opts.ctx.userId, opts.input)
        .then((xs) => xs.map((x) => ChatData.parse(x)))
    ),
  start: publicProcedure
    .input(ChatBranchStart)
    .output(ChatData)
    .mutation((opts) =>
      inject("chatBranchService")
        .start(opts.ctx.userId, opts.input)
        .then((x) => ChatData.parse(x))
    ),
});
