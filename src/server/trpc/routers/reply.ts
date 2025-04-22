import { ChatMessage } from "@/types/chat";
import { ReplyRegenerate } from "@/types/reply";
import { publicProcedure, t } from "../server";

export const replyRouter = t.router({
  regenerate: publicProcedure
    .input(ReplyRegenerate)
    .output(ChatMessage)
    .mutation(async (opts) =>
      opts.ctx.service.reply
        .regenerate(opts.ctx.userId, opts.input)
        .then((x) => ChatMessage.parse(x))
    ),
});
