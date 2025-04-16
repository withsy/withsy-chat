import { SendChatMessage, StartChat } from "@/types/chat";
import { serveStatic } from "@hono/node-server/serve-static";
import { TRPCError } from "@trpc/server";
import { Hono, type Context, type Next } from "hono";
import { logger } from "hono/logger";
import { StatusCodes } from "http-status-codes";
import { createApiContext, type ApiContext } from "../api-context";
import { envConfig } from "../env-config";
import { ApiError, HttpApiError, parseMessageFromUnknown } from "../error";
import { trpcRouter } from "./trpc";

declare module "hono" {
  interface ContextVariableMap {
    ctx: ApiContext;
  }
}

const trpcUi = new Hono().get("/", async (c) => {
  if (envConfig.nodeEnv !== "development") {
    return c.text("Not Found", 404);
  }
  const { renderTrpcPanel } = await import("trpc-ui");
  return c.html(
    renderTrpcPanel(trpcRouter, {
      url: "/api/trpc",
      transformer: "superjson",
    })
  );
});

const chats = new Hono()
  .post("/", async (c) => {
    const formData = await c.req.formData();
    const input = await StartChat.parseAsync({
      idempotencyKey: formData.get("idempotencyKey"),
      text: formData.get("text"),
      model: formData.get("model"),
      files: formData.getAll("files"),
    });

    checkFiles(input.files);

    const ctx = c.get("ctx");
    const res = await ctx.s.chat.start(ctx.userId, input);
    return c.json(res);
  })
  .post("/:chatId/messages", async (c) => {
    const { chatId } = c.req.param();
    const formData = await c.req.formData();
    const input = await SendChatMessage.parseAsync({
      chatId,
      idempotencyKey: formData.get("idempotencyKey"),
      text: formData.get("text"),
      model: formData.get("model"),
      parentId: formData.get("parentId"),
      files: formData.getAll("files"),
    });

    checkFiles(input.files);

    const ctx = c.get("ctx");
    const res = await ctx.s.chatMessage.send(input);
    return c.json(res);
  });

export const rest = new Hono().basePath("/api").use(logger());

rest.use(async (c: Context, next: Next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof ApiError) {
      return c.json(e, e.code);
    } else if (e instanceof TRPCError) {
      // TODO: error handling.
      console.warn("TRPCError conversion is required. error:", e);
      return c.json(e, 500);
    } else if (e instanceof Error) {
      // TODO: error handling.
      return c.json(e, 500);
    } else {
      // TODO: error handling.
      return c.json(parseMessageFromUnknown(e), 500);
    }
  }
});

rest.use(async (c: Context, next: Next) => {
  const ctx = await createApiContext();
  c.set("ctx", ctx);
  await next();
});

rest.route("/trpc-ui", trpcUi).route("/chats", chats);

if (process.env.NODE_ENV === "development") {
  console.log("Serve static enabled.");
  // NOTE: The file path must match the MockS3Service.
  rest.use(
    `/s3/*`,
    serveStatic({
      root: "./temp",
      onNotFound: (path) => console.error("Static file not found. path:", path),
    })
  );
}

function checkFiles(files?: File[]) {
  if (files && files.length > 10) {
    throw new HttpApiError(
      StatusCodes.BAD_REQUEST,
      "Maximum 10 file attachments allowed."
    );

    // TODO: check mime type.
  }
}
