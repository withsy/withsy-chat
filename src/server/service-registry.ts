import { AiProfileStorageService } from "./services/ai-profile-storage";
import { ChatService } from "./services/chat";
import { ChatBranchService } from "./services/chat-branch";
import { ChatPromptService } from "./services/chat-prompt";
import { createDb } from "./services/db";
import { EncryptionService } from "./services/encryption";
import { EnvValidationService } from "./services/env-validation";
import { GoogleGenAiService } from "./services/google-gen-ai";
import { GratitudeJournalService } from "./services/gratitude-journal";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageService } from "./services/message";
import { MessageChunkService } from "./services/message-chunk";
import { MessageReplyService } from "./services/message-reply";
import { ModelRouteService } from "./services/model-route";
import { NextAuthCsrfService } from "./services/next-auth-csrf";
import { OpenAiService } from "./services/open-ai";
import { createPgPool } from "./services/pg";
import { S3Service } from "./services/s3";
import { TaskService } from "./services/task";
import { UserService } from "./services/user";
import { UserAiProfileService } from "./services/user-ai-profile";
import { UserDefaultPromptService } from "./services/user-default-prompt";
import { UserLinkAccountService } from "./services/user-link-account";
import { UserPromptService } from "./services/user-prompt";
import { UserUsageLimitService } from "./services/user-usage-limit";
import { XAiService } from "./services/x-ai";
import { Container } from "./tdi";

const container = new Container({
  envValidation: () => new EnvValidationService(),
  pgPool: () => createPgPool(),
  db: () => createDb(),
  user: () => new UserService(),
  userLinkAccount: () => new UserLinkAccountService(),
  userUsageLimit: () => new UserUsageLimitService(),
  userPrompt: () => new UserPromptService(),
  userDefaultPrompt: () => new UserDefaultPromptService(),
  userAiProfile: () => new UserAiProfileService(),
  chat: () => new ChatService(),
  chatBranch: () => new ChatBranchService(),
  chatPrompt: () => new ChatPromptService(),
  gratitudeJournal: () => new GratitudeJournalService(),
  message: () => new MessageService(),
  messageChunk: () => new MessageChunkService(),
  messageReply: () => new MessageReplyService(),
  modelRoute: () => new ModelRouteService(),
  googleGenAi: () => new GoogleGenAiService(),
  openAi: () => new OpenAiService(),
  xAi: () => new XAiService(),
  idempotencyInfo: () => new IdempotencyInfoService(),
  task: () => new TaskService(),
  encryption: () => new EncryptionService(),
  s3: () => new S3Service(),
  aiProfileStorage: () => new AiProfileStorageService(),
  nextAuthCsrf: () => new NextAuthCsrfService(),
});

export const inject = container.getInjector();
