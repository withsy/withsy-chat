import { ChatStart } from "@/types/chat";
import { MessageSend } from "@/types/message";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { envConfig } from "../env-config";
import { appRouter } from "../trpc/routers/_app";
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

    const input = ChatStart.parse({
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

    const input = MessageSend.parse({
      chatId,
      idempotencyKey,
      text,
      model,
      parentId,
      files,
    });
    const res = await serverContext.service.message.send(
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
      renderTrpcPanel(appRouter, {
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
