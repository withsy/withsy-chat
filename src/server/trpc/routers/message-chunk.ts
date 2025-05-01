import { zAsyncIterable } from "@/server/z-async-iterable";
import { MessageChunk } from "@/types";
import { publicProcedure, t } from "../server";

export const messageChunkRouter = t.router({
  receive: publicProcedure
    .input(MessageChunk.Receive)
    .output(
      zAsyncIterable({
        yield: MessageChunk.ReceiveData,
        tracked: true,
      })
    )
    .subscription(async function* (opts) {
      yield* opts.ctx.service.messageChunk.receive(opts.ctx.userId, opts.input);
    }),
});
