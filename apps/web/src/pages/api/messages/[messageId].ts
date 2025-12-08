import {
  createNextPagesApiHandler,
  type Options,
} from "@/server/next-pages-api-handler";
import { serviceRegistry } from "@/server/service-registry";
import { MessageChunkEntity, MessageChunkEvent } from "@/types/message-chunk";
import type { UserUsageLimitData } from "@/types/user-usage-limit";
import { TRPCError } from "@trpc/server";
import { SuperJSON } from "superjson";

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
  const { userUsageLimitService, messageChunkService } = serviceRegistry;

  const messageId = request.query["messageId"];
  if (typeof messageId !== "string" || messageId.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  let isClosed = false;
  const close = async () => {
    if (isClosed) return;
    isClosed = true;

    response.end();
  };

  response.on("close", async () => await close());
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("Content-Encoding", "none");
  response.status(200);
  response.flushHeaders();

  const write = (event: MessageChunkEvent) => {
    response.write(`data: ${SuperJSON.stringify(event)}\n\n`);
  };

  try {
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

    while (!isClosed) {
      const entities = await messageChunkService.findMessageChunks({
        userId,
        messageId,
        index: lastIndex,
      });

      for (const entity of entities) {
        const { isDone } = await onEntity(entity);
        if (isDone) {
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    await close();
  }
}
