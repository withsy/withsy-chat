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
import { createPool } from "./pg";
import { TaskService } from "./task-service";
import { UserService } from "./user-service";

class ServiceRegistry<Defs extends Record<string, unknown>> {
  private map = new Map<keyof Defs, unknown>();

  set<K extends keyof Defs>(key: K, value: Defs[K]) {
    if (this.map.has(key)) throw new Error(`${String(key)} already exists.`);
    this.map.set(key, value);
  }

  get<K extends keyof Defs>(key: K): Defs[K] {
    const value = this.map.get(key);
    if (value === undefined) throw new Error(`${String(key)} does not exist.`);
    return value as Defs[K];
  }
}

type ServiceMap = {
  pool: Pool;
  db: Db;
  user: UserService;
  chat: ChatService;
  chatMessage: ChatMessageService;
  chatChunk: ChatChunkService;
  googleGenAi: GoogleGenAiService;
  task: TaskService;
};

const r = new ServiceRegistry<ServiceMap>();
export type Registry = typeof r;

await init();

async function init() {
  r.set("pool", createPool());
  r.set("db", createDb(r));
  r.set("user", new UserService(r));
  r.set("chat", new ChatService(r));
  r.set("chatMessage", new ChatMessageService(r));
  r.set("chatChunk", new ChatChunkService(r));
  r.set("googleGenAi", new GoogleGenAiService(r));

  const taskMap: TaskMap = {
    googleGenAiSendChat: (i) => r.get("googleGenAi").onSendChatTask(i),
    chatMessageCleanupZombies: () =>
      r.get("chatMessage").onCleanupZombiesTask(),
  };
  const cronTasks: CronTask[] = [
    { cron: "*/5 * * * *", key: "chatMessageCleanupZombies" },
  ];
  r.set("task", await TaskService.create(r.get("pool"), taskMap, cronTasks));
}

export async function createContext({}: CreateNextContextOptions) {
  // TODO: Parse auth header.
  const { id } = await r.get("user").getSeedUserId_DEV();
  return {
    r,
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
