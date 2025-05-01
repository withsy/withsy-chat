-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('chat', 'branch', 'gratitudeJournal');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT 'Buddy',
    "email" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "ai_language" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT '',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_link_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_link_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_usage_limits" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "daily_remaining" INTEGER NOT NULL,
    "daily_reset_at" TIMESTAMPTZ(6) NOT NULL,
    "minute_remaining" INTEGER NOT NULL,
    "minute_reset_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_usage_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prompts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title_encrypted" TEXT NOT NULL,
    "text_encrypted" TEXT NOT NULL,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_default_prompts" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "user_prompt_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_default_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title_encrypted" TEXT NOT NULL,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "type" "ChatType" NOT NULL DEFAULT 'chat',
    "parent_message_id" UUID,
    "user_prompt_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_prompts" (
    "id" SERIAL NOT NULL,
    "chat_id" UUID NOT NULL,
    "text_encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "model" TEXT,
    "text_encrypted" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'pending',
    "is_bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL,
    "parent_message_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_chunks" (
    "message_id" UUID NOT NULL,
    "index" INTEGER NOT NULL,
    "text_encrypted" TEXT NOT NULL,
    "raw_data_encrypted" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_chunks_pkey" PRIMARY KEY ("message_id","index")
);

-- CreateTable
CREATE TABLE "message_files" (
    "id" SERIAL NOT NULL,
    "message_id" UUID NOT NULL,
    "file_uri" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_infos" (
    "key" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_infos_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "gratitude_journals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "chat_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gratitude_journals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_link_accounts_user_id_idx" ON "user_link_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_link_accounts_provider_provider_account_id_key" ON "user_link_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_usage_limits_user_id_key" ON "user_usage_limits"("user_id");

-- CreateIndex
CREATE INDEX "user_usage_limits_user_id_idx" ON "user_usage_limits"("user_id");

-- CreateIndex
CREATE INDEX "user_prompts_user_id_idx" ON "user_prompts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_default_prompts_user_id_key" ON "user_default_prompts"("user_id");

-- CreateIndex
CREATE INDEX "user_default_prompts_user_id_idx" ON "user_default_prompts"("user_id");

-- CreateIndex
CREATE INDEX "user_default_prompts_user_prompt_id_idx" ON "user_default_prompts"("user_prompt_id");

-- CreateIndex
CREATE INDEX "chats_user_id_idx" ON "chats"("user_id");

-- CreateIndex
CREATE INDEX "chats_parent_message_id_idx" ON "chats"("parent_message_id");

-- CreateIndex
CREATE INDEX "chat_prompts_chat_id_idx" ON "chat_prompts"("chat_id");

-- CreateIndex
CREATE INDEX "messages_parent_message_id_idx" ON "messages"("parent_message_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_idx" ON "messages"("chat_id");

-- CreateIndex
CREATE INDEX "message_files_message_id_idx" ON "message_files"("message_id");

-- CreateIndex
CREATE INDEX "gratitude_journals_user_id_idx" ON "gratitude_journals"("user_id");

-- CreateIndex
CREATE INDEX "gratitude_journals_chat_id_idx" ON "gratitude_journals"("chat_id");

-- AddForeignKey
ALTER TABLE "user_link_accounts" ADD CONSTRAINT "user_link_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_usage_limits" ADD CONSTRAINT "user_usage_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_prompts" ADD CONSTRAINT "user_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_prompts" ADD CONSTRAINT "user_default_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_prompts" ADD CONSTRAINT "user_default_prompts_user_prompt_id_fkey" FOREIGN KEY ("user_prompt_id") REFERENCES "user_prompts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_prompt_id_fkey" FOREIGN KEY ("user_prompt_id") REFERENCES "user_prompts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_prompts" ADD CONSTRAINT "chat_prompts_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message_chunks" ADD CONSTRAINT "message_chunks_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message_files" ADD CONSTRAINT "message_files_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gratitude_journals" ADD CONSTRAINT "gratitude_journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gratitude_journals" ADD CONSTRAINT "gratitude_journals_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
