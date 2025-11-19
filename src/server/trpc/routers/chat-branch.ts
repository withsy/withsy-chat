import { ChatData, ChatListOutout } from "@/types/chat";
import { ChatBranchList, ChatBranchStart } from "@/types/chat-branch";
import { userProcedure, t } from "../server";

export const chatBranchRouter = t.router({
  list: userProcedure
    .input(ChatBranchList)
    .output(ChatListOutout)
    .query(({ ctx, input }) =>
      ctx.serviceRegistry.chatBranchService
        .list(ctx.userId, input)
        .then((xs) => xs.map((x) => ChatData.parse(x)))
    ),
  start: userProcedure
    .input(ChatBranchStart)
    .output(ChatData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.chatBranchStarter
        .start(ctx.userId, input)
        .then((x) => ChatData.parse(x))
    ),
});
