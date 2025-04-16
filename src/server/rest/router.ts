import { SendChatMessage, StartChat } from "@/types/chat";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { envConfig } from "../env-config";
import { trpcRouter } from "../trpc/router";
import {
  handleErrorMiddleware,
  parseServerContextMiddleware,
} from "./middleware";

const chats = new Hono()
  .use(parseServerContextMiddleware)
  .post("/", async (c) => {
    const formData = await c.req.formData();
    const idempotencyKey = formData.get("idempotencyKey");
    const text = formData.get("text");
    const model = formData.get("model");
    const files = formData.getAll("files");
    const serverContext = c.get("serverContext");

    const input = await StartChat.parseAsync({
      idempotencyKey,
      text,
      model,
      files,
    });
    const res = await serverContext.service.chat.start(
      serverContext.userId,
      input
    );
    return c.json(res);
  })
  .post("/:chatId/messages", async (c) => {
    const serverContext = c.get("serverContext");
    const { chatId } = c.req.param();
    const formData = await c.req.formData();
    const idempotencyKey = formData.get("idempotencyKey");
    const text = formData.get("text");
    const model = formData.get("model");
    const files = formData.getAll("files");
    const parentId = formData.get("parentId");

    const input = await SendChatMessage.parseAsync({
      chatId,
      idempotencyKey,
      text,
      model,
      parentId,
      files,
    });
    const res = await serverContext.service.chatMessage.send(
      serverContext.userId,
      input
    );
    return c.json(res);
  });

export const restServer = new Hono()
  .basePath("/api")
  .use(logger())
  .use(handleErrorMiddleware)
  .route("/chats", chats);

if (envConfig.nodeEnv === "development") {
  console.warn("Development endpoints /trpc-ui and /s3 are opened.");

  restServer.get("/trpc-ui", async (c) => {
    const { renderTrpcPanel } = await import("trpc-ui");
    return c.html(
      renderTrpcPanel(trpcRouter, {
        url: "/api/trpc",
        transformer: "superjson",
      })
    );
  });

  // NOTE: The file path must match the MockS3Service.
  restServer.use(
    `/s3/*`,
    serveStatic({
      root: "./temp",
      onNotFound: (path) => console.error("Static file not found. path:", path),
    })
  );
}
