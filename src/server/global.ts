import type { CronTask, TaskMap } from "@/types/task";
import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import "dotenv/config";
import type { Pool } from "pg";
import superjson from "superjson";
import { ChatChunkService } from "./chat-chunk-service";
import { ChatMessageService } from "./chat-message-service";
import { ChatService } from "./chat-service";
import { createDb, type Db } from "./db";
import { GoogleGenAiService } from "./google-gen-ai-service";
import { IdempotencyService } from "./idempotency-service";
import { createPool } from "./pg";
import { ServiceRegistryBase } from "./service-registry";
import { TaskService } from "./task-service";
import { UserService } from "./user-service";

type ServiceMap = {
  pool: Pool;
  db: Db;
  user: UserService;
  chat: ChatService;
  chatMessage: ChatMessageService;
  chatChunk: ChatChunkService;
  googleGenAi: GoogleGenAiService;
  task: TaskService;
  idempotency: IdempotencyService;
};

const s = new ServiceRegistryBase<ServiceMap>();
export type ServiceRegistry = typeof s;

await init();

async function init() {
  s.set("pool", createPool());
  s.set("db", createDb(s));
  s.set("user", new UserService(s));
  s.set("chat", new ChatService(s));
  s.set("chatMessage", new ChatMessageService(s));
  s.set("chatChunk", new ChatChunkService(s));
  s.set("googleGenAi", new GoogleGenAiService(s));
  s.set("idempotency", new IdempotencyService(s));

  const taskMap: TaskMap = {
    google_gen_ai_send_chat: (i) => s.get("googleGenAi").onSendChatTask(i),
    chat_message_cleanup_zombies: () =>
      s.get("chatMessage").onCleanupZombiesTask(),
  };
  const cronTasks: CronTask[] = [
    { cron: "*/5 * * * *", key: "chat_message_cleanup_zombies" },
  ];
  s.set("task", await TaskService.create(s, taskMap, cronTasks));
}

export async function createContext({}: CreateNextContextOptions) {
  // TODO: Parse auth heades.
  const { id } = await s.get("user").getSeedUserId_DEV();
  return {
    s,
    userId: id,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  sse: {
    maxDurationMs: 5 * 60 * 1_000, // 5 minutes
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

export const router = t.router;
export const procedure = t.procedure;
