import { MessageData } from "@/types/message";
import { MessageReplyRegenerate } from "@/types/message-reply";
import { userProcedure, t } from "../server";

export const messageReplyRouter = t.router({
  regenerate: userProcedure
    .input(MessageReplyRegenerate)
    .output(MessageData)
    .mutation(({ ctx, input }) =>
      ctx.serviceRegistry.messageReplyService
        .regenerate(ctx.userId, input)
        .then((x) => MessageData.parse(x))
    ),
});
