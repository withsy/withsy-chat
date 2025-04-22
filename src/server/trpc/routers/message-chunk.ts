import { zAsyncIterable } from "@/server/z-async-iterable";
import { MessageChunk, MessageChunkReceive } from "@/types/message-chunk";
import { publicProcedure, t } from "../server";

export const messageChunkRouter = t.router({
  receive: publicProcedure
    .input(MessageChunkReceive)
    .output(
      zAsyncIterable({
        yield: MessageChunk,
        tracked: true,
      })
    )
    .subscription(async function* (opts) {
      yield* opts.ctx.service.messageChunk.receive(opts.ctx.userId, opts.input);
    }),
});
