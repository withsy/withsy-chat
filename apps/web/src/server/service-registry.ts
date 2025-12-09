import { ApiKeyService } from "./api-key/api-key.service";
import { ChatService } from "./chat/chat.service";
import { EncryptionService } from "./encryption/encryption.service";
import { MessageChunkService } from "./message-chunk/message-chunk.service";
import { MessageService } from "./message/message.service";
import { AiProfileStorageService } from "./services/ai-profile-storage";
import { ChatBranchService } from "./services/chat-branch";
import { ChatBranchStarter } from "./services/chat-branch-starter";
import { ChatMessageDecryptService } from "./services/chat-message-decrypt";
import { ChatPromptService } from "./services/chat-prompt";
import { ChatStarter } from "./services/chat-starter";
import { createDb } from "./services/db";
import { GoogleGenAiService } from "./services/google-gen-ai";
import { GratitudeJournalService } from "./services/gratitude-journal";
import { GratitudeJournalChatStarter } from "./services/gratitude-journal-chat-starter";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageReplyService } from "./services/message-reply";
import { MessageSender } from "./services/message-sender";
import { ModelRouteService } from "./services/model-route";
import { NextAuthCsrfService } from "./services/next-auth-csrf";
import { createPgPool } from "./services/pg";
import { S3Service } from "./services/s3";
import { UserService } from "./services/user";
import { UserAiProfileService } from "./services/user-ai-profile";
import { UserDefaultPromptService } from "./services/user-default-prompt";
import { UserLinkAccountService } from "./services/user-link-account";
import { UserUsageLimitService } from "./services/user-usage-limit";
import { XAiService } from "./services/x-ai";
import { SupabaseActivityService } from "./supabase-activity/supabase-activity.service";
import { TickService } from "./tick/tick.service";
import { TimeZoneCheckService } from "./time-zone-check/time-zone-check.service";
import { UserPromptService } from "./user-prompt/user-prompt.service";

function createServiceRegistry() {
  const timeZoneCheckService = new TimeZoneCheckService();
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
  const messageService = new MessageService(
    encryptionService,
    chatMessageDecryptService,
    db,
    messageChunkService
  );
  const modelRouteService = new ModelRouteService(
    messageService,
    messageChunkService,
    googleGenAiService,
    xAiService,
    db,
    encryptionService,
    userDefaultPromptService,
    chatMessageDecryptService
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
  const apiKeyService = new ApiKeyService(db);
  const supabaseActivityService = new SupabaseActivityService(db);
  const tickService = new TickService(
    messageService,
    chatService,
    messageChunkService,
    userPromptService,
    supabaseActivityService
  );

  return {
    serviceRegistry: {
      timeZoneCheckService,
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
      messageService,
      modelRouteService,
      chatService,
      chatBranchService,
      gratitudeJournalService,
      messageReplyService,
      messageSender,
      chatStarter,
      chatBranchStarter,
      gratitudeJournalChatStarter,
      apiKeyService,
      tickService,
      supabaseActivityService,
    },
    close: async () => {
      await db.$disconnect();
      await pgPool.end();
    },
  };
}

const context = createServiceRegistry();
export const serviceRegistry = context.serviceRegistry;

let isCloseCalled = false;
const closeServiceRegistry = async () => {
  if (isCloseCalled) {
    return;
  }

  isCloseCalled = true;
  await context.close();
};

process.on("SIGINT", closeServiceRegistry);
process.on("SIGTERM", closeServiceRegistry);
