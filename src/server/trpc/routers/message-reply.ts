import { MessageData } from "@/types/message";
import { MessageReplyRegenerate } from "@/types/message-reply";
import { publicProcedure, t } from "../server";

export const messageReplyRouter = t.router({
  regenerate: publicProcedure
    .input(MessageReplyRegenerate)
    .output(MessageData)
    .mutation((opts) =>
      opts.ctx.service.messageReply
        .regenerate(opts.ctx.userId, opts.input)
        .then((x) => MessageData.parse(x))
    ),
});
