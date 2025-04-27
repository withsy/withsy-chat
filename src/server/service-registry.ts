import type { Pool } from "pg";
import { createLazyRegistry, type LazyRegistryProxy } from "./lazy-registry";
import { ChatService } from "./services/chat";
import { ChatBranchService } from "./services/chat-branch";
import { ChatPromptService } from "./services/chat-prompt";
import { createDb, type Db } from "./services/db";
import { GoogleGenAiService } from "./services/google-gen-ai";
import { GratitudeJournalService } from "./services/gratitude-journal";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageService } from "./services/message";
import { MessageChunkService } from "./services/message-chunk";
import { MessageFileService } from "./services/message-file";
import { MessageReplyService } from "./services/message-reply";
import { MockS3Service } from "./services/mock-s3";
import { ModelRouteService } from "./services/model-route";
import { OpenAiService } from "./services/open-ai";
import { createPgPool } from "./services/pg";
import { TaskService } from "./services/task";
import { UserService } from "./services/user";
import { UserDefaultPromptService } from "./services/user-default-prompt";
import { UserLinkAccountService } from "./services/user-link-account";
import { UserPromptService } from "./services/user-prompt";
import { UserUsageLimitService } from "./services/user-usage-limit";

type ServiceDefinition = {
  pgPool: Pool;
  db: Db;
  user: UserService;
  userLinkAccount: UserLinkAccountService;
  userUsageLimit: UserUsageLimitService;
  userPrompt: UserPromptService;
  userDefaultPrompt: UserDefaultPromptService;
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
  chatPrompt: ChatPromptService;
  gratitudeJournal: GratitudeJournalService;
};

export type ServiceRegistry = LazyRegistryProxy<ServiceDefinition>;

function createServiceRegistry() {
  return createLazyRegistry<ServiceDefinition>({
    pgPool: () => createPgPool(),
    db: (s) => createDb(s),
    user: (s) => new UserService(s),
    userLinkAccount: (s) => new UserLinkAccountService(s),
    userUsageLimit: (s) => new UserUsageLimitService(s),
    userPrompt: (s) => new UserPromptService(s),
    userDefaultPrompt: (s) => new UserDefaultPromptService(s),
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
    chatPrompt: (s) => new ChatPromptService(s),
    gratitudeJournal: (s) => new GratitudeJournalService(s),
  });
}

export const service = createServiceRegistry();
