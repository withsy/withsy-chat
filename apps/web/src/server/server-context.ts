import { ApiKeyService } from "./api-key/api-key.service";
import { ChatService } from "./chat/chat.service";
import { createDb } from "./db/db";
import { createPgPool } from "./db/pg-pool";
import { EncryptionService } from "./encryption/encryption.service";
import { GoogleGenAiService } from "./google-gen-ai/google-gen-ai.service";
import { MessageChunkService } from "./message-chunk/message-chunk.service";
import { MessageService } from "./message/message.service";
import { NextAuthCsrfService } from "./next-auth-csrf/next-auth-csrf.service";
import { S3Service } from "./s3/s3.service";
import { AiProfileStorageService } from "./services/ai-profile-storage";
import { ChatBranchService } from "./services/chat-branch";
import { ChatBranchStarter } from "./services/chat-branch-starter";
import { ChatMessageDecryptService } from "./services/chat-message-decrypt";
import { ChatPromptService } from "./services/chat-prompt";
import { ChatStarter } from "./services/chat-starter";
import { IdempotencyInfoService } from "./services/idempotency-info";
import { MessageReplyService } from "./services/message-reply";
import { MessageSender } from "./services/message-sender";
import { ModelRouteService } from "./services/model-route";
import { UserAiProfileService } from "./services/user-ai-profile";
import { UserDefaultPromptService } from "./services/user-default-prompt";
import { UserLinkAccountService } from "./services/user-link-account";
import { UserUsageLimitService } from "./services/user-usage-limit";
import { SupabaseActivityService } from "./supabase-activity/supabase-activity.service";
import { TickService } from "./tick/tick.service";
import { TimeZoneChecker } from "./time-zone-check/time-zone-checker";
import { UserPromptService } from "./user-prompt/user-prompt.service";
import { XAiService } from "./x-ai/x-ai.service";

function createServerContext() {
  new TimeZoneChecker();
  const pgPool = createPgPool();
  const db = createDb(pgPool);
  const googleGenAiService = new GoogleGenAiService();
  const xAiService = new XAiService();
  const encryptionService = new EncryptionService();
  const s3Service = new S3Service();
  const nextAuthCsrfService = new NextAuthCsrfService();

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
  const apiKeyService = new ApiKeyService(db);
  const supabaseActivityService = new SupabaseActivityService(db);
  const tickService = new TickService(
    messageService,
    chatService,
    messageChunkService,
    userPromptService,
    supabaseActivityService
  );

  let isCloseCalled = false;
  return {
    context: {
      googleGenAiService,
      xAiService,
      encryptionService,
      s3Service,
      nextAuthCsrfService,
      chatPromptService,
      pgPool,
      db,
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
      messageReplyService,
      messageSender,
      chatStarter,
      chatBranchStarter,
      apiKeyService,
      tickService,
      supabaseActivityService,
    },
    close: async () => {
      if (isCloseCalled) {
        return;
      }

      isCloseCalled = true;

      await db.$disconnect();
      await pgPool.end();
    },
  };
}

const result = createServerContext();
const { close } = result;

process.on("SIGINT", close);
process.on("SIGTERM", close);

export const serverContext = result.context;
export type ServerContext = typeof serverContext;
