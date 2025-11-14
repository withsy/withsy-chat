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

export const container = Container.newBuilder()
  .add("envValidationService", () => new EnvValidationService())
  .add("pgPool", () => createPgPool(), { destroy: (pgPool) => pgPool.end() })
  .add("db", () => createDb(), { destroy: (db) => db.$disconnect() })
  .add("userService", () => new UserService())
  .add("userLinkAccountService", () => new UserLinkAccountService())
  .add("userUsageLimitService", () => new UserUsageLimitService())
  .add("userPromptService", () => new UserPromptService())
  .add("userDefaultPromptService", () => new UserDefaultPromptService())
  .add("userAiProfileService", () => new UserAiProfileService())
  .add("chatService", () => new ChatService())
  .add("chatBranchService", () => new ChatBranchService())
  .add("chatPromptService", () => new ChatPromptService())
  .add("gratitudeJournalService", () => new GratitudeJournalService())
  .add("messageService", () => new MessageService())
  .add("messageChunkService", () => new MessageChunkService())
  .add("messageReplyService", () => new MessageReplyService())
  .add("modelRouteService", () => new ModelRouteService())
  .add("googleGenAiService", () => new GoogleGenAiService())
  .add("openAiService", () => new OpenAiService())
  .add("xAiService", () => new XAiService())
  .add("idempotencyInfoService", () => new IdempotencyInfoService())
  .add("taskService", () => new TaskService())
  .add("encryptionService", () => new EncryptionService())
  .add("s3Service", () => new S3Service())
  .add("aiProfileStorageService", () => new AiProfileStorageService())
  .add("nextAuthCsrfService", () => new NextAuthCsrfService())
  .build();

process.on("SIGTERM", () => container.destroy());

export const inject = container.getInjector();
