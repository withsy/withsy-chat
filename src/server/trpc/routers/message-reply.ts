import { Message, MessageReply } from "@/types";
import { publicProcedure, t } from "../server";

export const messageReplyRouter = t.router({
  regenerate: publicProcedure
    .input(MessageReply.Regenerate)
    .output(Message.Data)
    .mutation((opts) =>
      opts.ctx.service.messageReply
        .regenerate(opts.ctx.userId, opts.input)
        .then((x) => Message.Data.parse(x))
    ),
});
