import { StatusCodes } from "http-status-codes";
import type { Pool } from "pg";
import { envConfig } from "./env-config";
import { HttpApiError } from "./error";
import { createLazyRegistry, type LazyRegistryProxy } from "./lazy-registry";
import { ChatChunkService } from "./services/chat-chunk-service";
import { ChatMessageFileService } from "./services/chat-message-file-service";
import { ChatMessageService } from "./services/chat-message-service";
import { ChatService } from "./services/chat-service";
import { createDb, type Db } from "./services/db";
import { GoogleGenAiService } from "./services/google-gen-ai-service";
import { IdempotencyService } from "./services/idempotency-service";
import { MockS3Service } from "./services/mock-s3-service";
import { createPool } from "./services/pg";
import { TaskService } from "./services/task-service";
import { UserService } from "./services/user-service";

type ServiceDefinition = {
  pool: Pool;
  db: Db;
  user: UserService;
  chat: ChatService;
  chatMessage: ChatMessageService;
  chatMessageFile: ChatMessageFileService;
  chatChunk: ChatChunkService;
  googleGenAi: GoogleGenAiService;
  task: TaskService;
  idempotency: IdempotencyService;
  s3: MockS3Service;
};

export type ServiceRegistry = LazyRegistryProxy<ServiceDefinition>;

function createServiceRegistry() {
  return createLazyRegistry<ServiceDefinition>({
    pool: () => createPool(),
    db: (s) => createDb(s),
    user: (s) => new UserService(s),
    chat: (s) => new ChatService(s),
    chatMessage: (s) => new ChatMessageService(s),
    chatMessageFile: (s) => new ChatMessageFileService(s),
    chatChunk: (s) => new ChatChunkService(s),
    googleGenAi: (s) => new GoogleGenAiService(s),
    idempotency: (s) => new IdempotencyService(s),
    task: (s) => new TaskService(s),
    s3: (s) => {
      if (envConfig.nodeEnv === "development") return new MockS3Service(s);
      throw new HttpApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "S3 service is not implemented."
      );
    },
  });
}

export const s = createServiceRegistry();
