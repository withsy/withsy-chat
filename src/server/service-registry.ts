import type { Pool } from "pg";
import { createLazyRegistry, type LazyRegistryProxy } from "./lazy-registry";
import { ChatChunkService } from "./services/chat-chunk-service";
import { ChatMessageService } from "./services/chat-message-service";
import { ChatService } from "./services/chat-service";
import { createDb, type Db } from "./services/db";
import { GoogleGenAiService } from "./services/google-gen-ai-service";
import { IdempotencyService } from "./services/idempotency-service";
import { createPool } from "./services/pg";
import { TaskService } from "./services/task-service";
import { UserService } from "./services/user-service";

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

export type ServiceRegistry = LazyRegistryProxy<ServiceDefinition>;

function createServiceRegistry() {
  return createLazyRegistry<ServiceDefinition>({
    pool: () => createPool(),
    db: (s) => createDb(s),
    user: (s) => new UserService(s),
    chat: (s) => new ChatService(s),
    chatMessage: (s) => new ChatMessageService(s),
    chatChunk: (s) => new ChatChunkService(s),
    googleGenAi: (s) => new GoogleGenAiService(s),
    idempotency: (s) => new IdempotencyService(s),
    task: (s) => new TaskService(s),
  });
}

export const s = createServiceRegistry();
