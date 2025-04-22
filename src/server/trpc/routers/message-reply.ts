import { Message } from "@/types/message";
import { MessageReplyRegenerate } from "@/types/message-reply";
import { publicProcedure, t } from "../server";

export const messageReplyRouter = t.router({
  regenerate: publicProcedure
    .input(MessageReplyRegenerate)
    .output(Message)
    .mutation(async (opts) =>
      opts.ctx.service.messageReply
        .regenerate(opts.ctx.userId, opts.input)
        .then((x) => Message.parse(x))
    ),
});
