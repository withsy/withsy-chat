import { SendChatMessage, StartChat } from "@/types/chat";
import { serveStatic } from "@hono/node-server/serve-static";
import { TRPCError } from "@trpc/server";
import { Hono, type Context, type Next } from "hono";
import { logger } from "hono/logger";
import { StatusCodes } from "http-status-codes";
import { type Session } from "next-auth";
import type { IncomingMessage } from "node:http";
import { createApiContext, type ApiContext } from "../api-context";
import { envConfig } from "../env-config";
import {
  ApiError,
  HttpApiError,
  parseMessageFromUnknown,
  UnauthorizedApiError,
} from "../error";
import { trpcRouter } from "./trpc";

declare module "hono" {
  interface ContextVariableMap {
    apiCtx: ApiContext;
  }
}

export function setSessionToRequest(
  req: IncomingMessage,
  session: Session | null
) {
  Reflect.set(req, "session", session);
}

function getSessionFromHonoContext(c: Context) {
  const incoming = Reflect.get(c.env, "incoming") as
    | IncomingMessage
    | undefined;
  if (!incoming)
    throw new HttpApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Unexpected error occurred."
    );

  const session = Reflect.get(incoming, "session") as
    | Session
    | null
    | undefined;
  if (!session) throw new UnauthorizedApiError("Session does not exist.");
  return session;
}

const chats = new Hono()
  .use(async (c: Context, next: Next) => {
    const session = getSessionFromHonoContext(c);
    const apiCtx = await createApiContext(session);
    c.set("apiCtx", apiCtx);
    await next();
  })
  .post("/", async (c) => {
    const formData = await c.req.formData();
    const input = await StartChat.parseAsync({
      idempotencyKey: formData.get("idempotencyKey"),
      text: formData.get("text"),
      model: formData.get("model"),
      files: formData.getAll("files"),
    });

    checkFiles(input.files);

    const apiCtx = c.get("apiCtx");
    const res = await apiCtx.s.chat.start(apiCtx.userId, input);
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

    const apiCtx = c.get("apiCtx");
    const res = await apiCtx.s.chatMessage.send(input);
    return c.json(res);
  });

export const rest = new Hono()
  .basePath("/api")
  .use(logger())
  .use(async (c: Context, next: Next) => {
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
  })
  .route("/chats", chats);

if (envConfig.nodeEnv === "development") {
  console.warn("Development endpoints /trpc-ui and /s3 are opened.");

  rest.get("/trpc-ui", async (c) => {
    const { renderTrpcPanel } = await import("trpc-ui");
    return c.html(
      renderTrpcPanel(trpcRouter, {
        url: "/api/trpc",
        transformer: "superjson",
      })
    );
  });

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
