import { StatusCodes } from "http-status-codes";
import type { Pool } from "pg";
import { envConfig } from "./env-config";
import { HttpServerError } from "./error";
import { createLazyRegistry, type LazyRegistryProxy } from "./lazy-registry";
import { ChatChunkService } from "./services/chat-chunk-service";
import { ChatMessageFileService } from "./services/chat-message-file-service";
import { ChatMessageService } from "./services/chat-message-service";
import { ChatModelRouteService } from "./services/chat-model-route-service";
import { ChatService } from "./services/chat-service";
import { createDb, type Db } from "./services/db";
import { GoogleGenAiService } from "./services/google-gen-ai-service";
import { IdempotencyInfoService } from "./services/idempotency-info-service";
import { MockS3Service } from "./services/mock-s3-service";
import { OpenAiService } from "./services/open-ai-service";
import { createPool } from "./services/pg";
import { TaskService } from "./services/task-service";
import { UserLinkAccountService } from "./services/user-link-account-service";
import { UserService } from "./services/user-service";

type ServiceDefinition = {
  pool: Pool;
  db: Db;
  user: UserService;
  userLinkAccount: UserLinkAccountService;
  chat: ChatService;
  chatMessage: ChatMessageService;
  chatMessageFile: ChatMessageFileService;
  chatChunk: ChatChunkService;
  chatModelRoute: ChatModelRouteService;
  googleGenAi: GoogleGenAiService;
  openAi: OpenAiService;
  task: TaskService;
  idempotencyInfo: IdempotencyInfoService;
  s3: MockS3Service;
};

export type ServiceRegistry = LazyRegistryProxy<ServiceDefinition>;

function createServiceRegistry() {
  return createLazyRegistry<ServiceDefinition>({
    pool: () => createPool(),
    db: (s) => createDb(s),
    user: (s) => new UserService(s),
    userLinkAccount: (s) => new UserLinkAccountService(s),
    chat: (s) => new ChatService(s),
    chatMessage: (s) => new ChatMessageService(s),
    chatMessageFile: (s) => new ChatMessageFileService(s),
    chatChunk: (s) => new ChatChunkService(s),
    chatModelRoute: (s) => new ChatModelRouteService(s),
    googleGenAi: (s) => new GoogleGenAiService(s),
    openAi: (s) => new OpenAiService(s),
    idempotencyInfo: (s) => new IdempotencyInfoService(s),
    task: (s) => new TaskService(s),
    s3: (s) => new MockS3Service(s),
  });
}

export const service = createServiceRegistry();
