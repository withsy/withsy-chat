import { HttpServerError } from "@/server/error";
import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import {
  MessageChunkEntity,
  MessageChunkEvent,
  MessageChunkSelect,
} from "@/types/message-chunk";
import type { MessageChunkCreatedInput } from "@/types/task";
import type { UserUsageLimitData } from "@/types/user-usage-limit";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import SuperJSON from "superjson";

/**
 * @openapi
 * /api/messages/{messageId}:
 *   get:
 *     summary: Receive messages streaming
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *     responses:
 *       200:
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 */
export default createNextPagesApiHandler({ get });

export async function get(options: Options) {
  const { req, res, ctx } = options;
  const { service, userId } = ctx;

  const messageId = req.query["messageId"];
  if (typeof messageId !== "string" || messageId.length === 0)
    throw new HttpServerError(
      StatusCodes.BAD_REQUEST,
      getReasonPhrase(StatusCodes.BAD_REQUEST)
    );

  let isClosed = false;
  let unsubscribe: (() => Promise<void>) | null = null;
  const close = async () => {
    if (isClosed) return;
    isClosed = true;
    if (unsubscribe) await unsubscribe();
    res.end();
  };

  req.on("close", async () => await close());
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Encoding", "none");
  res.status(StatusCodes.OK);
  res.flushHeaders();

  const write = (event: MessageChunkEvent) => {
    res.write(`data: ${SuperJSON.stringify(event)}\n\n`);
  };

  const q: MessageChunkCreatedInput[] = [];
  unsubscribe = await service.task.subscribeMessageChunkCreated({
    messageId,
    handler: (input) => {
      q.push(input);
    },
  });

  try {
    const entities = await service.db.messageChunk.findMany({
      where: { message: { chat: { userId, deletedAt: null } }, messageId },
      orderBy: { index: "asc" },
      select: MessageChunkSelect,
    });

    let lastIndex = -1;

    const onEntity = async (entity: MessageChunkEntity) => {
      if (entity.isDone) {
        let usageLimits: UserUsageLimitData[] = [];
        try {
          usageLimits = await service.userUsageLimit.list(userId, {
            type: "message",
          });
        } catch (e) {
          console.error(
            "User usage limit getting failed. userId:",
            userId,
            " error:",
            e
          );
        }

        write({ type: "usageLimits", usageLimits });
      } else {
        const data = service.messageChunk.decrypt(entity);
        write({ type: "chunk", chunk: data });
      }

      lastIndex = entity.index;
      return { isDone: entity.isDone };
    };

    for (const entity of entities) {
      const { isDone } = await onEntity(entity);
      if (isDone) return;
    }

    while (true) {
      const input = q.shift();
      if (input) {
        const { index } = input;
        if (index > lastIndex) {
          const entity = await service.db.messageChunk.findUniqueOrThrow({
            where: {
              message: { chat: { userId, deletedAt: null } },
              messageId_index: { messageId, index },
            },
            select: MessageChunkSelect,
          });

          const { isDone } = await onEntity(entity);
          if (isDone) return;
        }
      } else {
        const isStaleCompleted = await service.message.isStaleCompleted({
          userId,
          messageId,
        });

        if (isStaleCompleted) return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    await close();
  }
}
