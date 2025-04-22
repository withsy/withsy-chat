import { Message } from "@/types/message";
import { ReplyRegenerate } from "@/types/reply";
import { publicProcedure, t } from "../server";

export const replyRouter = t.router({
  regenerate: publicProcedure
    .input(ReplyRegenerate)
    .output(Message)
    .mutation(async (opts) =>
      opts.ctx.service.reply
        .regenerate(opts.ctx.userId, opts.input)
        .then((x) => Message.parse(x))
    ),
});
