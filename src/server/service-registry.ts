import { AiProfileStorageService } from "./services/ai-profile-storage";
import { ChatService } from "./services/chat";
import { ChatBranchService } from "./services/chat-branch";
import { ChatBranchStarter } from "./services/chat-branch-starter";
import { ChatMessageDecryptService } from "./services/chat-message-decrypt";
import { ChatPromptService } from "./services/chat-prompt";
import { ChatStarter } from "./services/chat-starter";
import { ChatTaskHandler } from "./services/chat-task-handler";
import { createDb } from "./services/db";
import { EncryptionService } from "./services/encryption";
import { EnvValidationService } from "./services/env-validation";
import { GoogleGenAiService } from "./services/google-gen-ai";
import { GratitudeJournalService } from "./services/gratitude-journal";
import { GratitudeJournalChatStarter } from "./services/gratitude-journal-chat-starter";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageService } from "./services/message";
import { MessageChunkService } from "./services/message-chunk";
import { MessageReplyService } from "./services/message-reply";
import { MessageSender } from "./services/message-sender";
import { MessageTaskHandler } from "./services/message-task-handler";
import { ModelRouteService } from "./services/model-route";
import { NextAuthCsrfService } from "./services/next-auth-csrf";
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

function createServiceRegistry() {
  const envValidationService = new EnvValidationService();
  const googleGenAiService = new GoogleGenAiService();
  const xAiService = new XAiService();
  const encryptionService = new EncryptionService();
  const s3Service = new S3Service();
  const nextAuthCsrfService = new NextAuthCsrfService();
  const chatPromptService = new ChatPromptService();
  const pgPool = createPgPool();
  const db = createDb(pgPool);
  const userService = new UserService(encryptionService, db);
  const userLinkAccountService = new UserLinkAccountService(
    encryptionService,
    db
  );
  const userUsageLimitService = new UserUsageLimitService(db);
  const userPromptService = new UserPromptService(encryptionService, db);
  const userDefaultPromptService = new UserDefaultPromptService(
    userPromptService,
    db
  );
  const aiProfileStorageService = new AiProfileStorageService(s3Service);
  const userAiProfileService = new UserAiProfileService(
    encryptionService,
    db,
    aiProfileStorageService
  );
  const messageChunkService = new MessageChunkService(encryptionService, db);
  const idempotencyInfoService = new IdempotencyInfoService(db);
  const chatMessageDecryptService = new ChatMessageDecryptService(
    encryptionService,
    userPromptService
  );
  const chatTaskHandler = new ChatTaskHandler(db);
  const messageTaskHandler = new MessageTaskHandler(db);
  const messageService = new MessageService(
    encryptionService,
    chatMessageDecryptService,
    db,
    messageChunkService
  );
  const modelRouteService = new ModelRouteService(
    messageService,
    messageChunkService,
    pgPool,
    googleGenAiService,
    xAiService,
    db,
    encryptionService,
    userDefaultPromptService,
    chatMessageDecryptService
  );
  const taskService = new TaskService(
    modelRouteService,
    messageTaskHandler,
    messageChunkService,
    chatTaskHandler,
    userPromptService,
    pgPool
  );
  const chatService = new ChatService(
    encryptionService,
    db,
    chatMessageDecryptService
  );
  const chatBranchService = new ChatBranchService(
    db,
    chatMessageDecryptService
  );
  const gratitudeJournalService = new GratitudeJournalService(
    db,
    chatMessageDecryptService
  );
  const messageReplyService = new MessageReplyService(
    encryptionService,
    db,
    chatMessageDecryptService,
    modelRouteService
  );
  const messageSender = new MessageSender(
    db,
    encryptionService,
    chatMessageDecryptService,
    modelRouteService
  );
  const chatStarter = new ChatStarter(
    db,
    encryptionService,
    chatMessageDecryptService,
    modelRouteService
  );
  const chatBranchStarter = new ChatBranchStarter(
    db,
    chatMessageDecryptService,
    encryptionService
  );
  const gratitudeJournalChatStarter = new GratitudeJournalChatStarter(
    userService,
    encryptionService,
    db,
    chatMessageDecryptService,
    modelRouteService
  );

  return {
    serviceRegistry: {
      envValidationService,
      googleGenAiService,
      xAiService,
      encryptionService,
      s3Service,
      nextAuthCsrfService,
      chatPromptService,
      pgPool,
      db,
      userService,
      userLinkAccountService,
      userUsageLimitService,
      userPromptService,
      userDefaultPromptService,
      aiProfileStorageService,
      userAiProfileService,
      messageChunkService,
      idempotencyInfoService,
      chatMessageDecryptService,
      chatTaskHandler,
      messageTaskHandler,
      messageService,
      modelRouteService,
      taskService,
      chatService,
      chatBranchService,
      gratitudeJournalService,
      messageReplyService,
      messageSender,
      chatStarter,
      chatBranchStarter,
      gratitudeJournalChatStarter,
    },
    destroy: async () => {
      await db.$disconnect();
      await pgPool.end();
    },
  };
}

const result = createServiceRegistry();
export const serviceRegistry = result.serviceRegistry;

let destroyCalled = false;
const destroyServiceRegistry = async () => {
  if (destroyCalled) {
    return;
  }

  destroyCalled = true;
  await result.destroy();
};

process.on("SIGINT", destroyServiceRegistry);
process.on("SIGTERM", destroyServiceRegistry);
