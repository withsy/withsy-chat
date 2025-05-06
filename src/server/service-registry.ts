import type { Pool } from "pg";
import { createLazyObject, type LazyObject } from "./lazy-object";
import { ChatService } from "./services/chat";
import { ChatBranchService } from "./services/chat-branch";
import { ChatPromptService } from "./services/chat-prompt";
import { createDb, type Db } from "./services/db";
import { EncryptionService } from "./services/encryption";
import { FirebaseService } from "./services/firebase";
import { GoogleGenAiService } from "./services/google-gen-ai";
import { GratitudeJournalService } from "./services/gratitude-journal";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageService } from "./services/message";
import { MessageChunkService } from "./services/message-chunk";
import { MessageReplyService } from "./services/message-reply";
import { ModelRouteService } from "./services/model-route";
import { OpenAiService } from "./services/open-ai";
import { createPgPool } from "./services/pg";
import { TaskService } from "./services/task";
import { UserService } from "./services/user";
import { UserAiProfileService } from "./services/user-ai-profile";
import { UserDefaultPromptService } from "./services/user-default-prompt";
import { UserLinkAccountService } from "./services/user-link-account";
import { UserPromptService } from "./services/user-prompt";
import { UserUsageLimitService } from "./services/user-usage-limit";
import { XAiService } from "./services/x-ai";

type ServiceDefinition = {
  pgPool: Pool;
  db: Db;
  user: UserService;
  userLinkAccount: UserLinkAccountService;
  userUsageLimit: UserUsageLimitService;
  userPrompt: UserPromptService;
  userDefaultPrompt: UserDefaultPromptService;
  userAiProfile: UserAiProfileService;
  chat: ChatService;
  chatBranch: ChatBranchService;
  message: MessageService;
  messageChunk: MessageChunkService;
  messageReply: MessageReplyService;
  modelRoute: ModelRouteService;
  googleGenAi: GoogleGenAiService;
  openAi: OpenAiService;
  xAi: XAiService;
  task: TaskService;
  idempotencyInfo: IdempotencyInfoService;
  chatPrompt: ChatPromptService;
  gratitudeJournal: GratitudeJournalService;
  encryption: EncryptionService;
  firebase: FirebaseService;
};

export type ServiceRegistry = LazyObject<ServiceDefinition>;

function createServiceRegistry() {
  return createLazyObject<ServiceDefinition>({
    pgPool: (s) => createPgPool(s),
    db: (s) => createDb(s),
    user: (s) => new UserService(s),
    userLinkAccount: (s) => new UserLinkAccountService(s),
    userUsageLimit: (s) => new UserUsageLimitService(s),
    userPrompt: (s) => new UserPromptService(s),
    userDefaultPrompt: (s) => new UserDefaultPromptService(s),
    userAiProfile: (s) => new UserAiProfileService(s),
    chat: (s) => new ChatService(s),
    chatBranch: (s) => new ChatBranchService(s),
    chatPrompt: (s) => new ChatPromptService(s),
    gratitudeJournal: (s) => new GratitudeJournalService(s),
    message: (s) => new MessageService(s),
    messageChunk: (s) => new MessageChunkService(s),
    messageReply: (s) => new MessageReplyService(s),
    modelRoute: (s) => new ModelRouteService(s),
    googleGenAi: (s) => new GoogleGenAiService(s),
    openAi: (s) => new OpenAiService(s),
    xAi: (s) => new XAiService(s),
    idempotencyInfo: (s) => new IdempotencyInfoService(s),
    task: (s) => new TaskService(s),
    encryption: (s) => new EncryptionService(s),
    firebase: (s) => new FirebaseService(s),
  });
}

export const service = createServiceRegistry();
