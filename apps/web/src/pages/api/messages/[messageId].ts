import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import { serviceRegistry } from "@/server/service-registry";
import { listen } from "@/server/services/pg";
import {
  MessageChunkEntity,
  MessageChunkEvent,
  MessageChunkSelect,
} from "@/types/message-chunk";
import { PgEvent, type PgEventInput } from "@/types/task";
import type { UserUsageLimitData } from "@/types/user-usage-limit";
import { TRPCError } from "@trpc/server";
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
  const { ctx } = options;
  const { userId, request, response } = ctx;
  const pgPool = serviceRegistry.pgPool;
  const db = serviceRegistry.db;
  const userUsageLimitService = serviceRegistry.userUsageLimitService;
  const messageChunkService = serviceRegistry.messageChunkService;
  const messageService = serviceRegistry.messageService;

  const messageId = request.query["messageId"];
  if (typeof messageId !== "string" || messageId.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  let isClosed = false;
  let unlisten: (() => Promise<void>) | null = null;
  const close = async () => {
    if (isClosed) return;
    isClosed = true;
    if (unlisten) await unlisten();
    response.end();
  };

  request.on("close", async () => await close());
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("Content-Encoding", "none");
  response.status(200);
  response.flushHeaders();

  const write = (event: MessageChunkEvent) => {
    response.write(`data: ${SuperJSON.stringify(event)}\n\n`);
  };

  const q: PgEventInput<"message_chunk_created">[] = [];

  unlisten = await listen(
    pgPool,
    "message_chunk_created",
    PgEvent.message_chunk_created,
    (input) => {
      if (input.messageId !== messageId) return;
      q.push(input);
    }
  );

  try {
    const entities = await db.messageChunk.findMany({
      where: { message: { chat: { userId, deletedAt: null } }, messageId },
      orderBy: { index: "asc" },
      select: MessageChunkSelect,
    });

    let lastIndex = -1;

    const onEntity = async (entity: MessageChunkEntity) => {
      if (entity.isDone) {
        let usageLimits: UserUsageLimitData[] = [];
        try {
          usageLimits = await userUsageLimitService.list(userId, {
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
        const data = messageChunkService.decrypt(entity);
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
          const entity = await db.messageChunk.findUniqueOrThrow({
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
        const isStaleCompleted = await messageService.isStaleCompleted({
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
