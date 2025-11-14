import { AiProfileStorageService } from "./services/ai-profile-storage";
import { ChatService } from "./services/chat";
import { ChatBranchService } from "./services/chat-branch";
import { ChatMessageDecryptService } from "./services/chat-message-decrypt";
import { ChatPromptService } from "./services/chat-prompt";
import { ChatTaskHandler } from "./services/chat-task-handler";
import { createDb } from "./services/db";
import { EncryptionService } from "./services/encryption";
import { EnvValidationService } from "./services/env-validation";
import { GoogleGenAiService } from "./services/google-gen-ai";
import { GratitudeJournalService } from "./services/gratitude-journal";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageService } from "./services/message";
import { MessageChunkService } from "./services/message-chunk";
import { MessageReplyService } from "./services/message-reply";
import { MessageTaskHandler } from "./services/message-task-handler";
import { ModelRouteService } from "./services/model-route";
import { NextAuthCsrfService } from "./services/next-auth-csrf";
import { OpenAiService } from "./services/open-ai";
import { createPgPool } from "./services/pg";
import { S3Service } from "./services/s3";
import { TaskService } from "./services/task";
import { TaskAdder } from "./services/task-adder";
import { UserService } from "./services/user";
import { UserAiProfileService } from "./services/user-ai-profile";
import { UserDefaultPromptService } from "./services/user-default-prompt";
import { UserLinkAccountService } from "./services/user-link-account";
import { UserPromptService } from "./services/user-prompt";
import { UserUsageLimitService } from "./services/user-usage-limit";
import { XAiService } from "./services/x-ai";
import { DiContainer } from "./tdi";

export const diContainer = DiContainer.newBuilder()
  .add("envValidationService", () => new EnvValidationService())
  .add("pgPool", () => createPgPool(), { destroy: (pgPool) => pgPool.end() })
  .add("db", ({ inject }) => createDb(inject("pgPool")), {
    destroy: (db) => db.$disconnect(),
  })
  .add("encryptionService", () => new EncryptionService())
  .add(
    "userService",
    ({ inject }) => new UserService(inject("encryptionService"), inject("db"))
  )
  .add(
    "userLinkAccountService",
    ({ inject }) =>
      new UserLinkAccountService(inject("encryptionService"), inject("db"))
  )
  .add(
    "userUsageLimitService",
    ({ inject }) => new UserUsageLimitService(inject("db"))
  )
  .add(
    "userPromptService",
    ({ inject }) =>
      new UserPromptService(inject("encryptionService"), inject("db"))
  )
  .add(
    "userDefaultPromptService",
    ({ inject }) =>
      new UserDefaultPromptService(inject("userPromptService"), inject("db"))
  )
  .add("s3Service", () => new S3Service())
  .add(
    "aiProfileStorageService",
    ({ inject }) => new AiProfileStorageService(inject("s3Service"))
  )
  .add(
    "userAiProfileService",
    ({ inject }) =>
      new UserAiProfileService(
        inject("encryptionService"),
        inject("db"),
        inject("aiProfileStorageService")
      )
  )
  .add(
    "messageChunkService",
    ({ inject }) =>
      new MessageChunkService(inject("encryptionService"), inject("db"))
  )
  .add("googleGenAiService", () => new GoogleGenAiService())
  // .add("openAiService", () => new OpenAiService())
  .add("xAiService", () => new XAiService())
  .add(
    "idempotencyInfoService",
    ({ inject }) => new IdempotencyInfoService(inject("db"))
  )
  .add("nextAuthCsrfService", () => new NextAuthCsrfService())
  .add(
    "chatMessageDecryptService",
    ({ inject }) =>
      new ChatMessageDecryptService(
        inject("encryptionService"),
        inject("userPromptService")
      )
  )
  .add("chatPromptService", () => new ChatPromptService())
  .add("chatTaskHandler", ({ inject }) => new ChatTaskHandler(inject("db")))
  .add(
    "messageTaskHandler",
    ({ inject }) => new MessageTaskHandler(inject("db"))
  )
  .add("taskAdder", () => new TaskAdder())
  .add(
    "messageService",
    ({ inject }) =>
      new MessageService(
        inject("encryptionService"),
        inject("chatMessageDecryptService"),
        inject("db"),
        inject("messageChunkService"),
        inject("taskAdder")
      )
  )
  .add(
    "modelRouteService",
    ({ inject }) =>
      new ModelRouteService(
        inject("messageService"),
        inject("messageChunkService"),
        inject("pgPool"),
        inject("googleGenAiService"),
        inject("xAiService"),
        inject("db"),
        inject("encryptionService"),
        inject("userDefaultPromptService"),
        inject("chatMessageDecryptService")
      )
  )
  .add(
    "taskService",
    ({ inject }) =>
      new TaskService(
        inject("modelRouteService"),
        inject("messageTaskHandler"),
        inject("messageChunkService"),
        inject("chatTaskHandler"),
        inject("userPromptService"),
        inject("pgPool"),
        inject("taskAdder")
      )
  )
  .add(
    "chatService",
    ({ inject }) =>
      new ChatService(
        inject("encryptionService"),
        inject("db"),
        inject("chatMessageDecryptService"),
        inject("taskAdder")
      )
  )
  .add(
    "chatBranchService",
    ({ inject }) =>
      new ChatBranchService(
        inject("db"),
        inject("encryptionService"),
        inject("chatMessageDecryptService")
      )
  )
  .add(
    "gratitudeJournalService",
    ({ inject }) =>
      new GratitudeJournalService(
        inject("db"),
        inject("userService"),
        inject("encryptionService"),
        inject("chatMessageDecryptService"),
        inject("taskAdder")
      )
  )
  .add(
    "messageReplyService",
    ({ inject }) =>
      new MessageReplyService(
        inject("encryptionService"),
        inject("db"),
        inject("taskAdder"),
        inject("chatMessageDecryptService")
      )
  )
  .build();

diContainer.init();

const destroy = () => diContainer.destroy();

process.on("SIGINT", destroy);
process.on("SIGTERM", destroy);
