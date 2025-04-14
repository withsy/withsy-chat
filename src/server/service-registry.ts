import type { CronTask, TaskMap } from "@/types/task";
import type { Pool } from "pg";
import { ChatChunkService } from "./chat-chunk-service";
import { ChatMessageService } from "./chat-message-service";
import { ChatService } from "./chat-service";
import { createDb, type Db } from "./db";
import { GoogleGenAiService } from "./google-gen-ai-service";
import { IdempotencyService } from "./idempotency-service";
import { LazyRegistry } from "./lazy-registry";
import { createPool } from "./pg";
import { TaskService } from "./task-service";
import { UserService } from "./user-service";

type ServiceDefinition = {
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

export type ServiceRegistry = LazyRegistry<ServiceDefinition>;

export async function createServiceRegistry() {
  const pool = createPool();
  const db = createDb(pool);
  const user = new UserService(db);
  const chat = new ChatService(await r.get("db"), await r.get("task"));

  return new LazyRegistry<ServiceDefinition>({
    pool: () => createPool(),
    db: async (r) => createDb(await r.get("pool")),
    user: async (r) => new UserService(await r.get("db")),
    chat: async (r) => new ChatService(await r.get("db"), await r.get("task")),
    chatMessage: async (r) =>
      new ChatMessageService(await r.get("db"), await r.get("task")),
    chatChunk: async (r) =>
      new ChatChunkService(
        await r.get("pool"),
        await r.get("db"),
        await r.get("chatMessage")
      ),
    googleGenAi: async (r) =>
      new GoogleGenAiService(
        await r.get("pool"),
        await r.get("chatMessage"),
        await r.get("chatChunk")
      ),
    idempotency: async (r) => new IdempotencyService(await r.get("db")),
    task: async (r) => {
      const googleGenAi = await r.get("googleGenAi");
      const chatMessage = await r.get("chatMessage");
      const taskMap: TaskMap = {
        google_gen_ai_send_chat: (i) => googleGenAi.onSendChatTask(i),
        chat_message_cleanup_zombies: () => chatMessage.onCleanupZombiesTask(),
      };
      const cronTasks: CronTask[] = [
        { cron: "*/5 * * * *", key: "chat_message_cleanup_zombies" },
      ];
      return await TaskService.create(await r.get("pool"), taskMap, cronTasks);
    },
  });
}
