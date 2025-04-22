import { zAsyncIterable } from "@/server/z-async-iterable";
import { ChatMessageChunk } from "@/types/chat-message-chunk";
import { MessageChunkReceive } from "@/types/message-chunk";
import { publicProcedure, t } from "../server";

export const messageChunkRouter = t.router({
  receive: publicProcedure
    .input(MessageChunkReceive)
    .output(
      zAsyncIterable({
        yield: ChatMessageChunk,
        tracked: true,
      })
    )
    .subscription(async function* (opts) {
      yield* opts.ctx.service.messageChunk.receive(opts.ctx.userId, opts.input);
    }),
});
