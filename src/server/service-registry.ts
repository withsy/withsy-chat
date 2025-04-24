import type { Pool } from "pg";
import { createLazyRegistry, type LazyRegistryProxy } from "./lazy-registry";
import { ChatBranchService } from "./services/chat-branch-service";
import { ChatService } from "./services/chat-service";
import { createDb, type Db } from "./services/db";
import { GoogleGenAiService } from "./services/google-gen-ai-service";
import { GratitudeJournalService } from "./services/gratitude-journal-service";
import { IdempotencyInfoService } from "./services/idempotency-info-service";
import { MessageChunkService } from "./services/message-chunk-service";
import { MessageFileService } from "./services/message-file-service";
import { MessageReplyService } from "./services/message-reply-service";
import { MessageService } from "./services/message-service";
import { MockS3Service } from "./services/mock-s3-service";
import { ModelRouteService } from "./services/model-route-service";
import { OpenAiService } from "./services/open-ai-service";
import { createPgPool } from "./services/pg";
import { PromptService } from "./services/prompt-service";
import { TaskService } from "./services/task-service";
import { UserLinkAccountService } from "./services/user-link-account-service";
import { UserPrefsService } from "./services/user-prefs-service";
import { UserUsageLimitService } from "./services/user-usage-limit-service";

type ServiceDefinition = {
  pgPool: Pool;
  db: Db;
  userPrefs: UserPrefsService;
  userLinkAccount: UserLinkAccountService;
  userUsageLimit: UserUsageLimitService;
  chat: ChatService;
  chatBranch: ChatBranchService;
  message: MessageService;
  messageFile: MessageFileService;
  messageChunk: MessageChunkService;
  messageReply: MessageReplyService;
  modelRoute: ModelRouteService;
  googleGenAi: GoogleGenAiService;
  openAi: OpenAiService;
  task: TaskService;
  idempotencyInfo: IdempotencyInfoService;
  s3: MockS3Service;
  prompt: PromptService;
  gratitudeJournal: GratitudeJournalService;
};

export type ServiceRegistry = LazyRegistryProxy<ServiceDefinition>;

function createServiceRegistry() {
  return createLazyRegistry<ServiceDefinition>({
    pgPool: () => createPgPool(),
    db: (s) => createDb(s),
    userPrefs: (s) => new UserPrefsService(s),
    userLinkAccount: (s) => new UserLinkAccountService(s),
    userUsageLimit: (s) => new UserUsageLimitService(s),
    chat: (s) => new ChatService(s),
    chatBranch: (s) => new ChatBranchService(s),
    message: (s) => new MessageService(s),
    messageFile: (s) => new MessageFileService(s),
    messageChunk: (s) => new MessageChunkService(s),
    messageReply: (s) => new MessageReplyService(s),
    modelRoute: (s) => new ModelRouteService(s),
    googleGenAi: (s) => new GoogleGenAiService(s),
    openAi: (s) => new OpenAiService(s),
    idempotencyInfo: (s) => new IdempotencyInfoService(s),
    task: (s) => new TaskService(s),
    s3: (s) => new MockS3Service(s),
    prompt: (s) => new PromptService(s),
    gratitudeJournal: (s) => new GratitudeJournalService(s),
  });
}

export const service = createServiceRegistry();
