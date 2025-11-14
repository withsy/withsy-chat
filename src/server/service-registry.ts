import { AiProfileStorageService } from "./services/ai-profile-storage";
import { ChatService } from "./services/chat";
import { ChatBranchService } from "./services/chat-branch";
import { ChatPromptService } from "./services/chat-prompt";
import { DbProvider } from "./services/db";
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
import { PgPoolProvider } from "./services/pg";
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
  .addProvider("envValidationService", () => new EnvValidationService())
  .addProvider("pgPool", new PgPoolProvider())
  .addProvider("db", new DbProvider())
  .addProvider("userService", () => new UserService())
  .addProvider("userLinkAccountService", () => new UserLinkAccountService())
  .addProvider("userUsageLimitService", () => new UserUsageLimitService())
  .addProvider("userPromptService", () => new UserPromptService())
  .addProvider("userDefaultPromptService", () => new UserDefaultPromptService())
  .addProvider("userAiProfileService", () => new UserAiProfileService())
  .addProvider("chatService", () => new ChatService())
  .addProvider("chatBranchService", () => new ChatBranchService())
  .addProvider("chatPromptService", () => new ChatPromptService())
  .addProvider("gratitudeJournalService", () => new GratitudeJournalService())
  .addProvider("messageService", () => new MessageService())
  .addProvider("messageChunkService", () => new MessageChunkService())
  .addProvider("messageReplyService", () => new MessageReplyService())
  .addProvider("modelRouteService", () => new ModelRouteService())
  .addProvider("googleGenAiService", () => new GoogleGenAiService())
  .addProvider("openAiService", () => new OpenAiService())
  .addProvider("xAiService", () => new XAiService())
  .addProvider("idempotencyInfoService", () => new IdempotencyInfoService())
  .addProvider("taskService", () => new TaskService())
  .addProvider("encryptionService", () => new EncryptionService())
  .addProvider("s3Service", () => new S3Service())
  .addProvider("aiProfileStorageService", () => new AiProfileStorageService())
  .addProvider("nextAuthCsrfService", () => new NextAuthCsrfService())
  .build();

process.on("SIGTERM", () => container.destroy());

export const inject = container.getInjector();
